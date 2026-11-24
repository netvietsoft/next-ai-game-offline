package com.nextai.gameoffline.billing

import org.junit.Assert.*
import org.junit.Test

/** Kiểm thử giá bản địa/offer/expiry cache / Tests localized prices, offer selection and cache expiry. */
class SubscriptionOfferPolicyTest {
    private val weekly = BillingConstants.SUBSCRIPTIONS.first()

    /** Phase trả về giả lập Play / Fixture phase supplied as if by Play. */
    private fun recurring(price: String = "249.000 ₫", currency: String = "VND", period: String = "P1W") =
        SubscriptionOfferPolicy.Phase(price, currency, 249000000000L, period, 0, 1)
    /** Offer trả về giả lập Play / Fixture eligible Play offer. */
    private fun offer(id: String? = null, base: String = "weekly", phases: List<SubscriptionOfferPolicy.Phase> = listOf(recurring())) =
        SubscriptionOfferPolicy.Offer(base, id, "opaque-play-offer-token", phases)

    @Test fun baseOfferRetainsPlayFormattedCurrencyWithoutInventingTrial() {
        val selected = SubscriptionOfferPolicy.select(weekly, listOf(offer()))!!
        assertEquals("opaque-play-offer-token", selected.token)
        val text = SubscriptionOfferPolicy.disclosure(selected)
        assertTrue(text.contains("249.000 ₫"))
        assertFalse(text.contains("free trial"))
        assertFalse(text.contains("$"))
    }

    @Test fun eligibleIntendedTrialUsesActualPlayDurationAndRenewalPrice() {
        val trial = SubscriptionOfferPolicy.Phase("Free", "EUR", 0L, "P5D", 1, 2)
        val trialOffer = offer("weekly-premium", phases = listOf(trial, recurring("8,99 €", "EUR")))
        val selected = SubscriptionOfferPolicy.select(weekly, listOf(offer(), trialOffer))!!
        val text = SubscriptionOfferPolicy.disclosure(selected)
        assertTrue(text.contains("5 days free trial"))
        assertTrue(text.contains("8,99 € every 1 week"))
        assertEquals("weekly-premium", selected.offerId)
    }

    @Test fun refusesWrongBasePeriodOrMissingRecurringPrice() {
        assertNull(SubscriptionOfferPolicy.select(weekly, listOf(offer(base = "monthly"))))
        assertNull(SubscriptionOfferPolicy.select(weekly, listOf(offer(phases = listOf(recurring(period = "P1M"))))))
        assertNull(SubscriptionOfferPolicy.select(weekly, listOf(offer(phases = emptyList()))))
        assertNull(SubscriptionOfferPolicy.select(weekly, listOf(offer(phases = listOf(recurring(price = ""))))))
    }

    @Test fun doesNotInventEligibilityOrPickOtherPromotions() {
        val trial = SubscriptionOfferPolicy.Phase("Free", "VND", 0L, "P3D", 1, 2)
        assertNull(SubscriptionOfferPolicy.select(weekly, listOf(offer("another-promotion", phases = listOf(trial, recurring())))))
        val discount = SubscriptionOfferPolicy.Phase("100.000 ₫", "VND", 100000000000L, "P1W", 2, 2)
        assertNull(SubscriptionOfferPolicy.select(weekly, listOf(offer("weekly-premium", phases = listOf(trial, discount, recurring())))))
    }

    @Test fun exactRequestedPlansUseMatchingBillingPeriods() {
        assertEquals(listOf("game_premium", "game_premium_monthly", "game_premium_yearly"), BillingConstants.SUBSCRIPTIONS.map { it.productId })
        BillingConstants.SUBSCRIPTIONS.forEach { definition ->
            assertNotNull(SubscriptionOfferPolicy.select(definition, listOf(offer(base = definition.basePlanId, phases = listOf(recurring(period = definition.billingPeriod))))))
        }
    }

    @Test fun cachedSubscriptionExpiresButLifetimeDoesNot() {
        val checked = 1_000_000L
        assertTrue(PremiumCachePolicy.isActive(false, true, checked, checked + PremiumCachePolicy.OFFLINE_LEASE_MS - 1))
        assertFalse(PremiumCachePolicy.isActive(false, true, checked, checked + PremiumCachePolicy.OFFLINE_LEASE_MS))
        assertFalse(PremiumCachePolicy.isActive(false, true, checked, checked - 1))
        assertFalse(PremiumCachePolicy.isActive(false, true, 0, checked))
        assertTrue(PremiumCachePolicy.isActive(true, false, 0, Long.MAX_VALUE))
    }
}
