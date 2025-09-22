package com.beta.financegram.ui.news

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ProgressBar
import android.widget.TextView
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.beta.financegram.BuildConfig
import com.beta.financegram.R
import com.beta.financegram.net.ApiService

class NewsFragment : Fragment() {

    private lateinit var list: RecyclerView
    private lateinit var progress: ProgressBar
    private lateinit var errorText: TextView
    private val adapter = NewsAdapter()
    private val vm by lazy {
        NewsViewModel(ApiService.create(BuildConfig.API_BASE_URL))
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        val root = inflater.inflate(R.layout.fragment_news, container, false)
        list = root.findViewById(R.id.news_list)
        progress = root.findViewById(R.id.progress)
        errorText = root.findViewById(R.id.error_text)

        list.layoutManager = LinearLayoutManager(requireContext())
        list.adapter = adapter

        return root
    }

    override fun onResume() {
        super.onResume()
        vm.load()
        observe()
    }

    private fun observe() {
        // Simple manual observation without LiveData/Compose for brevity
        // Pull once after load; for a production app, wire a collector with lifecycle
        view?.postDelayed(object : Runnable {
            override fun run() {
                val state = vm.state.value
                progress.visibility = if (state.loading) View.VISIBLE else View.GONE
                errorText.visibility = if (state.error != null) View.VISIBLE else View.GONE
                if (state.error != null) errorText.text = state.error
                adapter.submit(state.items)
                if (state.loading) {
                    view?.postDelayed(this, 200)
                }
            }
        }, 50)
    }
}
