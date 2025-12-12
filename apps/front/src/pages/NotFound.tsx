import { A } from '@solidjs/router';

export default function NotFound() {
	return (
		<section style={{ 'text-align': 'center', 'margin-top': '2rem' }}>
			<h2>404 — Page Not Found</h2>
			<p>Sorry, the page you are looking for does not exist.</p>
			<p>
				<A href="/">Go back to Home</A>
			</p>
		</section>
	);
}
