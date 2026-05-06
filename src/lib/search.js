/**
 * Searches the live web using Tavily AI Search API.
 * Returns top N results with title, URL, and content snippet.
 */
export async function searchWeb(query, maxResults = 5) {
  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: process.env.TAVILY_API_KEY,
      query,
      search_depth: "advanced",
      include_answer: false,
      include_raw_content: false,
      max_results: maxResults,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Tavily API error:", err);
    throw new Error(`Search API error: ${response.status}`);
  }

  const data = await response.json();
  return (data.results || []).map((r) => ({
    title: r.title,
    url: r.url,
    content: r.content,
  }));
}
