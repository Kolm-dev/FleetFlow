import { login, type LoginErrorResponse } from "@/api/auth";
import { Spinner } from "@/components/Spinner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState, type FormEvent } from "react";
import { NavLink, useNavigate } from "react-router";

export const Login = () => {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { mutate, isPending, error } = useMutation({
        mutationFn: () => login({ name, password }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["currentUser"],
            });
            navigate("/");
        },
    });
    const handleSubmitForm = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        mutate();
    };

    let errorMessage = null;

    if (axios.isAxiosError<LoginErrorResponse>(error)) {
        errorMessage = error.response?.data.message || "Connection error";
    }

    return (
        <section className="login">
            <div className="login__header">
                <h1>Sign in</h1>

                <p>Use your credentials to access your account.</p>
            </div>

            <form
                className="login__form"
                onSubmit={handleSubmitForm}
                method="post"
            >
                <label htmlFor="name">
                    Name
                    <input
                        id="name"
                        name="name"
                        value={name}
                        type="text"
                        autoComplete="username"
                        placeholder="Your name"
                        onChange={(e) => setName(e.currentTarget.value)}
                    />
                </label>

                <label htmlFor="password">
                    Password
                    <input
                        id="password"
                        name="password"
                        value={password}
                        type="password"
                        autoComplete="current-password"
                        placeholder="Enter password"
                        onChange={(e) => setPassword(e.currentTarget.value)}
                    />
                </label>

                {errorMessage && <p className="login__error">{errorMessage}</p>}

                <button
                    disabled={isPending || !(name && password)}
                    type="submit"
                >
                    {isPending ? <Spinner text="Logging in..." /> : "Login"}
                </button>

                <p className="login__switch">
                    Don&apos;t have an account?{" "}
                    <NavLink to="/registration">Create account</NavLink>
                </p>
            </form>
        </section>
    );
};
