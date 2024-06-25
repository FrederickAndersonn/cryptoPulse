export interface NewsData {
    id: string;
    publisher: {
      name: string;
      homepage_url: string;
      logo_url: string;
      favicon_url: string;
    };
    title: string;
    author: string;
    published_utc: string;
    article_url: string;
    tickers: string[];
    amp_url: string;
    image_url: string;
    description: string;
    keywords: string[];
  }
  
  export const fetchAllNewsData = async (): Promise<NewsData[]> => {
    try {
      const response = await fetch(
        `https://api.polygon.io/v2/reference/news?limit=100&apiKey=MIi0BKAlXNALVBDfyalbyZMH47IMoTzk`
      );
      if (!response.ok) {
        throw new Error(`Failed to fetch news. Status: ${response.status}`);
      }
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  };
  