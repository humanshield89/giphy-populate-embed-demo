import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const queryParams: URLSearchParams = event.url.searchParams || new URLSearchParams();
	const limit = parseInt(queryParams.get('limit') || "20")
	const page = parseInt(queryParams.get('page') || '1')
	const username = queryParams.get('username') ? queryParams.get('username') : '1inch';

	const url = `https://api.giphy.com/v1/gifs/search?api_key=7TLUK3oMz1BJgN7mALHkvME3n33c9nlQ&q=%40${username}&limit=${limit}&offset=${
		(page - 1) * limit
	}&rating=g&lang=en&bundle=messaging_non_clips`;

	const response = await fetch(url);

	const data = await response.json();

	return {
		gifs: data.data,
		page,
		limit,
		username,
		total: data.pagination.total_count,
		pages: Math.ceil(data.pagination.total_count / limit)
	};
};
