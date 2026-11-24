package com.nextai.gameoffline.billing

/** Chính sách offer thuần Kotlin để kiểm thử không phụ thuộc Play / Pure offer policy testable without Play. */
object SubscriptionOfferPolicy {
    /** Giá đã định dạng bởi Play, không tự chuyển đổi tiền / Play-formatted pricing, never locally converted. */
    data class Phase(val formattedPrice: String, val currency: String, val micros: Long,
        val period: String, val cycles: Int, val recurrence: Int)
    /** Offer do Play trả về cho user / Offer returned by Play for this user. */
    data class Offer(val basePlanId: String, val offerId: String?, val token: String, val phases: List<Phase>)

    /** Chọn trial hợp lệ hoặc base plan; không tự suy điều kiện từ quốc gia.
     * Choose an eligible trial or base plan without inferring eligibility from the country. */
    fun select(definition: SubscriptionDefinition, offers: List<Offer>): Offer? {
        val valid = offers.filter { offer ->
            offer.basePlanId == definition.basePlanId && offer.token.isNotBlank() &&
                offer.phases.isNotEmpty() && offer.phases.all {
                    it.formattedPrice.isNotBlank() &&
                        it.currency.isNotBlank() &&
                        it.micros >= 0 &&
                        periodLabel(it.period) != null
                } && offer.phases.last().let {
                    it.recurrence == 1 && it.micros > 0 && it.period == definition.billingPeriod
                }
        }
        // Chỉ chọn trial đơn giản hoặc base price; offer khác cần UI riêng.
        // Only show an audited single-trial or base-price structure; other offers need dedicated UI.
        return valid.filter {
            it.offerId == definition.trialOfferId &&
                it.phases.size == 2 &&
                it.phases.first().micros == 0L &&
                it.phases.first().cycles == 1 &&
                it.phases.first().recurrence == 2
        }
            .sortedBy { it.offerId.orEmpty() }
            .firstOrNull()
            ?: valid.firstOrNull { it.offerId == null && it.phases.size == 1 }
    }

    /** Render giá/chu kỳ thực từ Play / Render actual Play prices and billing periods. */
    fun disclosure(offer: Offer): String {
        val recurring = offer.phases.last()
        val price = "${recurring.formattedPrice} every ${periodLabel(recurring.period)}"
        return if (offer.phases.size > 1 && offer.phases.first().micros == 0L) {
            "${periodLabel(offer.phases.first().period)} free trial, then $price. Renews automatically until canceled."
        } else "$price. Renews automatically until canceled."
    }

    /** Đọc ISO period do Play gửi, không hardcode ngày trial / Read Play's ISO period instead of hardcoding trial days. */
    fun periodLabel(period: String): String? {
        val match = Regex("^P([1-9][0-9]*)([DWMY])$").matchEntire(period) ?: return null
        val count = match.groupValues[1].toIntOrNull() ?: return null
        val unit = when (match.groupValues[2]) {
            "D" -> "day"
            "W" -> "week"
            "M" -> "month"
            else -> "year"
        }
        return "$count $unit${if (count == 1) "" else "s"}"
    }
}
