import { useNavigate } from '@solidjs/router';
import { createEffect, JSX, Show } from 'solid-js';
import * as Cache from '@api';

interface ProtectedRouteProps {
	children: JSX.Element;
}

export function ProtectedRoute(props: ProtectedRouteProps) {
	const navigate = useNavigate();

	const isAuthenticated = () => {
		return !!localStorage.getItem('current_user_id');
	};

	createEffect(() => {
		if (!isAuthenticated()) {
			navigate('/', { replace: true });
		}
	});

	return <Show when={isAuthenticated()}>{props.children}</Show>;
}
