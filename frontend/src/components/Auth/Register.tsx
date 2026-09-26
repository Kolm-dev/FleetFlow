import {
    register,
    type RegisterCredentials,
    type ValidationErrorResponse,
} from "@/api/auth";
import { Footer } from "@/components/Footer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router";

export const Register = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const { mutate, isPending, error } = useMutation({
        mutationFn: (data: RegisterCredentials) => register(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ["currentUser"],
            });
            navigate("/");
        },
    });

    const handleFormSubmit = (e: React.FormEvent): void => {
        e.preventDefault();
        mutate({
            name,
            password,
            password_confirmation: passwordConfirmation,
        });
    };

    const validationErrors =
        axios.isAxiosError<ValidationErrorResponse>(error) &&
        error.response?.status === 422
            ? error.response.data.errors
            : null;

    const generalErrorMessage =
        error && !validationErrors
            ? axios.isAxiosError<ValidationErrorResponse>(error)
                ? error.response?.data.message || "Connection error"
                : "Something went wrong"
            : null;

    return (
        <>
            {" "}
            <section className="login">
                <div className="login__header">
                    <h1>Create account</h1>

                    <p>Create your profile to start using FleetFlow.</p>
                </div>

                <form
                    onSubmit={handleFormSubmit}
                    className="login__form"
                    method="post"
                >
                    <label htmlFor="name">
                        Name
                        <input
                            onChange={(e) => setName(e.currentTarget.value)}
                            value={name}
                            name="name"
                            type="text"
                            autoComplete="username"
                            placeholder="Your name"
                        />
                        {validationErrors?.name?.[0] && (
                            <p className="login__error">
                                {validationErrors.name[0]}
                            </p>
                        )}
                    </label>

                    <label htmlFor="password">
                        Password
                        <input
                            onChange={(e) => setPassword(e.currentTarget.value)}
                            value={password}
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Create password"
                        />
                        {validationErrors?.password?.[0] && (
                            <p className="login__error">
                                {validationErrors.password[0]}
                            </p>
                        )}
                    </label>

                    <label htmlFor="password_confirmation">
                        Confirm password
                        <input
                            onChange={(e) =>
                                setPasswordConfirmation(e.currentTarget.value)
                            }
                            value={passwordConfirmation}
                            name="password_confirmation"
                            type="password"
                            autoComplete="new-password"
                            placeholder="Repeat password"
                        />
                        {validationErrors?.password_confirmation?.[0] && (
                            <p className="login__error">
                                {validationErrors.password_confirmation[0]}
                            </p>
                        )}
                    </label>

                    <button disabled={isPending} type="submit">
                        Register
                    </button>

                    {generalErrorMessage && (
                        <p className="login__error">{generalErrorMessage}</p>
                    )}

                    <p className="login__switch">
                        Already have an account?{" "}
                        <NavLink to="/authorization">Login</NavLink>
                    </p>
                </form>
            </section>
            <Footer />
        </>
    );
};
