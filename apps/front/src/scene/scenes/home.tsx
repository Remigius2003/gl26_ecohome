import { TopDown } from '../logic/topdown';
import { Scene } from '../core/types';

const Home: Scene = {
	avatar: { x: 400, y: 300 },
	movement: new TopDown({ x: 400, y: 300 }),
	canvas: null!,

	init(canvas) {
		this.canvas = canvas;
		this.movement = new TopDown(this.avatar);
	},
	clean(): void {},

	handleInput(input) {
		this.movement.update(16, input);
		this.avatar.x = this.movement['position'].x;
		this.avatar.y = this.movement['position'].y;
	},

	update() {},

	render(ctx) {
		ctx.fillStyle = '#1e3a5f';
		ctx.fillRect(0, 0, 800, 600);

		ctx.fillStyle = '#37474f';
		ctx.fillRect(0, 550, 800, 50);

		const rooms = [
			{ name: 'Living Room', x: 200, y: 150, w: 180, h: 120, color: '#29b6f6' },
			{ name: 'Kitchen', x: 420, y: 150, w: 180, h: 120, color: '#ffca28' },
			{ name: 'Bedroom', x: 200, y: 350, w: 180, h: 120, color: '#ab47bc' },
			{ name: 'Bathroom', x: 420, y: 350, w: 180, h: 120, color: '#26a69a' },
		];

		rooms.forEach((room) => {
			ctx.fillStyle = room.color + '80';
			ctx.fillRect(room.x, room.y, room.w, room.h);
			ctx.strokeStyle = '#ffffff';
			ctx.lineWidth = 2;
			ctx.strokeRect(room.x, room.y, room.w, room.h);
			ctx.font = '18px Arial';
			ctx.fillStyle = '#ffffff';
			ctx.textAlign = 'center';
			ctx.fillText(room.name, room.x + room.w / 2, room.y + room.h / 2);
		});

		ctx.fillStyle = '#4fc3f7';
		ctx.beginPath();
		ctx.arc(this.avatar.x, this.avatar.y, 25, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = '#ffffff';
		ctx.lineWidth = 3;
		ctx.stroke();
	},
};

export default Home;
