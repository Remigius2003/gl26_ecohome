import { useNavigate } from '@solidjs/router';
import { createEffect, JSX, Show } from 'solid-js';
import { Session } from '@api';

interface ProtectedRouteProps {
	children: JSX.Element;
}

export function ProtectedRoute(props: ProtectedRouteProps) {
	const navigate = useNavigate();

	createEffect(() => {
		if (!Session.isAuthenticated) navigate('/', { replace: true });
	});

	return <Show when={Session.isAuthenticated}>{props.children}</Show>;
}
