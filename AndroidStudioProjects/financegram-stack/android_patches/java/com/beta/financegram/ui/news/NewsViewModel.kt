package com.beta.financegram.ui.news

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.beta.financegram.net.ApiService
import com.beta.financegram.net.NewsItem
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class NewsViewModel(
    private val api: ApiService
) : ViewModel() {

    private val _state = MutableStateFlow(State())
    val state: StateFlow<State> = _state

    data class State(
        val loading: Boolean = true,
        val items: List<NewsItem> = emptyList(),
        val error: String? = null
    )

    fun load() {
        if (!_state.value.loading && _state.value.items.isNotEmpty()) return
        _state.value = _state.value.copy(loading = true, error = null)
        viewModelScope.launch {
            try {
                val data = api.getNews()
                _state.value = State(loading = false, items = data, error = null)
            } catch (e: Exception) {
                _state.value = State(loading = false, error = e.message ?: "Unknown error")
            }
        }
    }
}
