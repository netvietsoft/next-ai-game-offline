"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerDocument = void 0;
exports.swaggerDocument = {
    openapi: "3.0.0",
    info: {
        title: "NextAI Game Offline - Backend & Admin CMS API",
        version: "2.1.0",
        description: "Hệ thống API RESTful và CMS quản trị nền tảng 423 Game Offline chạy trên cổng 6033"
    },
    servers: [
        {
            url: "http://localhost:6033",
            description: "Local Development Server"
        }
    ],
    paths: {
        "/api/v1/auth/login": {
            post: {
                summary: "Đăng nhập Admin CMS",
                tags: ["Authentication"],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    username: { type: "string", example: "admin" },
                                    password: { type: "string", example: "NextAIAdmin@2026" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: "Đăng nhập thành công, trả về JWT token" },
                    401: { description: "Sai thông tin đăng nhập" }
                }
            }
        },
        "/api/v1/games": {
            get: {
                summary: "Lấy danh sách 423 Mini-Game cho App Client và CMS",
                tags: ["Games Catalog"],
                parameters: [
                    { name: "category", in: "query", schema: { type: "string" }, description: "Lọc theo thể loại (Puzzle, 2 Players...)" },
                    { name: "search", in: "query", schema: { type: "string" }, description: "Tìm kiếm theo từ khóa" }
                ],
                responses: {
                    200: { description: "Danh sách mini-game" }
                }
            }
        },
        "/api/v1/devices/register": {
            post: {
                summary: "Đăng ký hoặc cập nhật thiết bị Android",
                tags: ["Devices"],
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    device_id: { type: "string", example: "sam_s23_001" },
                                    app_version: { type: "string", example: "2.1.0" },
                                    os_version: { type: "string", example: "Android 14" },
                                    device_model: { type: "string", example: "Samsung Galaxy S23" }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: "Cập nhật thiết bị thành công" },
                    201: { description: "Đăng ký thiết bị mới thành công" }
                }
            }
        },
        "/api/v1/ads/config": {
            get: {
                summary: "Lấy cấu hình hiển thị quảng cáo và chiến dịch offline video",
                tags: ["Ads"],
                responses: {
                    200: { description: "Cấu hình quảng cáo" }
                }
            }
        },
        "/api/v1/media/upload": {
            post: {
                summary: "Tải lên tệp đa phương tiện đồng bộ Cloudflare R2",
                tags: ["Media Storage"],
                responses: {
                    201: { description: "Tải tệp thành công" }
                }
            }
        }
    }
};
