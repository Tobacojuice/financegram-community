package com.beta.financegram.net

data class NewsItem(
    val title: String,
    val summary: String,
    val url: String,
    val source: String,
    val tickers: List<String> = emptyList(),
    val publishedAt: String,
    val sentiment: String? = null,
    val thumbnailUrl: String? = null,
    val provider: String? = null
)

data class MarketQuote(
    val symbol: String,
    val label: String,
    val price: Double,
    val change: Double,
    val changePercent: Double,
    val updatedAt: String?
)
