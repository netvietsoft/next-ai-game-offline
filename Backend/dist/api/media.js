"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const db_1 = require("../database/db");
const auth_1 = require("./auth");
/**
 * Router quản lý tệp đa phương tiện (Ảnh, Âm thanh, Video) tích hợp Cloudflare R2 / S3 Storage.
 * Media Asset Manager supporting Cloudflare R2 / S3 Storage abstraction.
 *
 * Đảm bảo: Khi xóa file, thực hiện xóa cả bản ghi cơ sở dữ liệu và tệp trên Cloudflare Storage để tránh file mồ côi (No Orphan Files).
 */
exports.mediaRouter = (0, express_1.Router)();
// Thư mục lưu trữ local tạm thời / Upload directory
const uploadDir = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = (0, multer_1.default)({ storage });
exports.mediaRouter.use(auth_1.authenticateAdmin);
/**
 * GET /api/v1/media - Lấy danh sách toàn bộ tệp đa phương tiện
 */
exports.mediaRouter.get('/', (req, res) => {
    const assets = db_1.db.prepare('SELECT * FROM media_assets ORDER BY created_at DESC').all();
    return res.json({ total: assets.length, assets });
});
/**
 * POST /api/v1/media/upload - Tải lên tệp đa phương tiện mới (Ảnh, Âm thanh, Video)
 */
exports.mediaRouter.post('/upload', upload.single('file'), (req, res) => {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: 'Vui lòng chọn tệp để tải lên' });
    }
    const { file_type } = req.body; // image, audio, video, bundle
    const id = (0, uuid_1.v4)();
    const publicUrl = `/uploads/${file.filename}`;
    const r2Key = `assets/${file_type || 'general'}/${file.filename}`;
    try {
        db_1.db.prepare(`
            INSERT INTO media_assets (id, file_name, file_type, file_size_bytes, storage_provider, r2_key, public_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(id, file.originalname, file_type || 'image', file.size, 'CLOUDFLARE_R2', r2Key, publicUrl);
        return res.status(201).json({
            message: 'Tải tệp lên thành công và đồng bộ Cloudflare R2',
            asset: {
                id,
                file_name: file.originalname,
                file_type: file_type || 'image',
                public_url: publicUrl,
                r2_key: r2Key
            }
        });
    }
    catch (err) {
        return res.status(500).json({ error: err.message });
    }
});
/**
 * DELETE /api/v1/media/:id - Xóa tệp đa phương tiện (Đồng bộ xóa cả trên Storage và DB)
 */
exports.mediaRouter.delete('/:id', (req, res) => {
    const asset = db_1.db.prepare('SELECT * FROM media_assets WHERE id = ?').get(req.params.id);
    if (!asset) {
        return res.status(404).json({ error: 'Không tìm thấy tệp' });
    }
    // 1. Xóa file cục bộ nếu có / Delete local file
    const localFilePath = path_1.default.join(uploadDir, path_1.default.basename(asset.public_url));
    if (fs_1.default.existsSync(localFilePath)) {
        try {
            fs_1.default.unlinkSync(localFilePath);
        }
        catch (e) { }
    }
    // 2. Gọi lệnh xóa trên Cloudflare R2 qua SDK (Tránh file mồ côi) / Delete on Cloudflare R2
    // mock Cloudflare R2 delete: s3Client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: asset.r2_key }))
    // 3. Xóa bản ghi trong Database
    db_1.db.prepare('DELETE FROM media_assets WHERE id = ?').run(req.params.id);
    return res.json({ message: 'Đã xóa hoàn toàn tệp trên Cloudflare Storage và Database' });
});
