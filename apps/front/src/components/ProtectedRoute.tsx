import { useNavigate } from '@solidjs/router';
import { createEffect, JSX, Show } from 'solid-js';
import { Session } from '@api';

interface ProtectedRouteProps {
	children: JSX.Element;
}

export function ProtectedRoute(props: ProtectedRouteProps) {
	const navigate = useNavigate();

	createEffect(() => {
		if (!Session.isAuthenticated()) navigate('/login', { replace: true });
	});

	return (
		<Show when={Session.isAuthenticated()} fallback={null}>
			{props.children}
		</Show>
	);
}

export const ProtectedLayout = (props: any) => {
	return <ProtectedRoute>{props.children}</ProtectedRoute>;
};
