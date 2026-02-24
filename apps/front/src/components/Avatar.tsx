import { Component, createSignal, createEffect, Show } from 'solid-js';

const Avatar: Component<{
	url?: string;
	username: string;
	size?: 'mini' | 'large';
}> = (props) => {
	const [imgError, setImgError] = createSignal(false);

	createEffect(() => {
		if (props.url) setImgError(false);
	});

	const initial = () => props.username?.[0]?.toUpperCase() ?? '?';
	const sizeClass = () =>
		props.size === 'large' ? 'avatar-large' : 'avatar-mini';

	return (
		<div class={`avatar-component ${sizeClass()}`}>
			<Show
				when={!!props.url && !imgError()}
				fallback={<span class="avatar-placeholder">{initial()}</span>}
			>
				<img
					src={props.url}
					alt={props.username}
					onError={() => setImgError(true)}
				/>
			</Show>
		</div>
	);
};

export default Avatar;
