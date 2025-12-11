export async function createAccountApi(
    login: string,
    mdp: string,
    email: string
): Promise<boolean> {
    const dest = import.meta.env.VITE_AUTH_HOST;

    try {
        console.log(import.meta.env.VITE_AUTH_HOST);
        console.log(`${dest}/register`);
        const response = await fetch(`https://${dest}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                login,
                email,
                mdp,
            }),
        });

        if (!response.ok) {
            console.error(
                "Error during account creation:",
                response.statusText
            );
            return false;
        }

        const data = await response.json();
        console.log(data);
        return true;
    } catch (error) {
        console.error("Network/Server error:", error);
        return false;
    }
}
