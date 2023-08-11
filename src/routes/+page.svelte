<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	type Gif = {
		bitly_gif_url: string;
		analytics: {
			onload: {
				url: string;
			};
			onclick: {
				url: string;
			};
		};
		images: {
			original: {
				url: string;
				webp: string;
				height: string;
				width: string;
			};
			fixed_height_downsampled: {
				url: string;
				webp: string;
				height: string;
				width: string;
			};
			fixed_width_downsampled: {
				url: string;
				webp: string;
				height: string;
				width: string;
			};
		};
	};

	let username = $page.data.username;
	/*
	$: url = `https://api.giphy.com/v1/gifs/search?api_key=7TLUK3oMz1BJgN7mALHkvME3n33c9nlQ&q=%40${username}&limit=25&offset=0&rating=g&lang=en&bundle=messaging_non_clips`;
*/
	$: gifs = ($page.data.gifs || []) as Array<Gif>;
	let randomId: string;
	/*
	const fetchGifs = async () => {
		const response = await fetch(url);
		const json = await response.json();
		console.log(json);
		gifs = json.data;
	};
*/
	const getRandomIdFromGiphy = async () => {
		// read randomID from storage or generate new one

		randomId = localStorage.getItem('randomId') || '';

		if (!randomId) {
			const url = `https://api.giphy.com/v1/randomid?api_key=7TLUK3oMz1BJgN7mALHkvME3n33c9nlQ`;

			const res = await fetch(url);

			const json = await res.json();

			if (res.ok) {
				randomId = json.data.random_id;
				localStorage.setItem('randomId', randomId);
			}
		}
	};

	onMount(() => {
		// fetchGifs();
		getRandomIdFromGiphy();

		console.log('gifs', $page.data);
	});

	$: availablePages =
		// generate array of $page.data.pages length
		Array.from({ length: $page.data.pages }, (_, i) => i + 1);

	$: console.log('availablePages', availablePages);
</script>

<h1>Giphy Embed demo</h1>

<form
	style="text-align: center;"
	on:submit={(e) => {
		e.preventDefault();
		goto($page.url.pathname + '?username=' + username);
	}}
>
	<input bind:value={username} type="text" placeholder="Giphy username without @" />
	<button>Populate gifs</button>
</form>

<div class="pagination">
	{#each availablePages as pageNum}
		<a
			href="{$page.url.pathname}?username={$page.data.username}&page={pageNum}"
			class="pagination-btn"
			class:active={$page.data.page === pageNum}
		>
			{pageNum}
		</a>
	{/each}
</div>

<div class="grid-wrapper container">
	{#each gifs as gif}
		<div class={`box`}>
			<a
				href={gif.bitly_gif_url}
				target="_blank"
				on:click={async () => {
					await fetch(gif.analytics.onclick.url + '&random_id=' + randomId + '&ts=' + Date.now());
				}}
			>
				<img
					src={gif.images.fixed_width_downsampled.webp}
					alt="meme"
					width={Number(gif.images.fixed_width_downsampled.width) * 2}
					height={Number(gif.images.fixed_width_downsampled.height) * 2}
					loading="lazy"
					on:load={async () => {
						await fetch(gif.analytics.onload.url + '&random_id=' + randomId + '&ts=' + Date.now());
					}}
				/>
			</a>
		</div>
	{/each}
</div>
<div class="pagination">
	{#each availablePages as pageNum}
		<a
			href="{$page.url.pathname}?username={$page.data.username}&page={pageNum}"
			class="pagination-btn"
			class:active={$page.data.page === pageNum}
		>
			{pageNum}
		</a>
	{/each}
</div>

{#if gifs.length === 0}
	<div class="alert-info">No gifs found make sure the username is valid</div>
{/if}

<!--
<style>
	:root {
		--dark: #373349;
		--gap: 15px;
		--width: 240px;
		--height: var(--width);
	}

	:global(html, body) {
		background-color: var(--dark);
	}

	:global(body) {
		margin: var(--gap);
	}

	.container > a {
		position: relative;
		display: flex;
		justify-content: center;
		align-items: center;
		font-size: 2em;
		overflow: hidden;
	}

	.container > a::after {
		content: '';
		background: linear-gradient(transparent, black);
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		transform: translateY(100%);
		transition-duration: 0.75s;
	}

	.container > a:hover::after {
		transform: translateY(50%);
	}

	.container > a > * {
		width: 100%;
		height: 100%;
		object-fit: fill;
		transition-duration: 1s;
	}

	.container > a:hover > img {
		transform: scale(1.05);
	}

	.container {
		display: grid;
		grid-gap: var(--gap);
		grid-template-columns: repeat(auto-fit, minmax(var(--width), 1fr));
		grid-auto-rows: var(--height);
		grid-auto-flow: dense;
	}

	.horizontal {
		grid-column: span 2;
	}

	.vertical {
		grid-row: span 2;
	}

	.big {
		grid-column: span 2;
		grid-row: span 2;
	}
</style>
-->
<style>
	.pagination-btn {
		padding: 10px;
		border-radius: 5px;
		border: 1px solid #ccc;
		margin-bottom: 10px;
	}
	.active {
		background-color: #ccc;
	}
	.pagination {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 10px;
		margin-bottom: 10px;
	}
	form {
		margin: auto;
		max-width: 1200px;
		text-align: center;
		display: flex;
		gap: 10px;
	}
	input {
		flex: 1;
		padding: 10px;
		border-radius: 5px;
		border: 1px solid #ccc;
		margin-bottom: 10px;
	}
	button {
		padding: 10px;
		border-radius: 5px;
		border: 1px solid #ccc;
		margin-bottom: 10px;
	}
	button:hover {
		cursor: pointer;
		background-color: #ccc;
	}

	.alert-info {
		text-align: center;
		width: 100%;
		padding: 10px;
		background-color: #f1f1f1;
		border-radius: 5px;
		margin-bottom: 10px;
	}
	h1 {
		font-size: 2em;
		font-weight: 600;
		margin-bottom: 10px;
		text-align: center;
	}
	*:before,
	*:after,
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	.container {
		max-width: 1200px;
		margin: 20px auto;
		columns: 4;
		column-gap: 20px;
	}

	.container .box {
		width: 100%;
		margin-bottom: 10px;
		break-inside: avoid;
	}

	.container .box img {
		max-width: 100%;
		border-radius: 15px;
	}

	@media (max-width: 1200px) {
		.container {
			width: calc(100% - 40px);
			columns: 3;
		}
	}

	@media (max-width: 768px) {
		.container {
			columns: 2;
		}
	}

	@media (max-width: 480px) {
		.container {
			columns: 1;
		}
	}
</style>
