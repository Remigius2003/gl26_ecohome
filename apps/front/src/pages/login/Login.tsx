import "./Login.css";

export default function Login() {
    return (
        <div class="login-container">
            <img 
                src="login/uneMAISON.png"
                alt="Illustration"
                
            />
            <input 
                type="text"
                placeholder="Email"
                style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ccc"
                }}
            />
            <input 
                type="password"
                placeholder="Mot de passe"
            />

            <button>
                Se connecter
            </button>
        </div>
    );
}
