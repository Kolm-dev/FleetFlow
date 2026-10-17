import { login, type LoginErrorResponse } from "@/api/auth";
import { AuthForm, type AuthFormField } from "@/components/Auth/AuthForm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { LockKeyhole, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";

export const Login = () => {
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { mutate, isPending, error } = useMutation({
        mutationFn: () => login({ name, password, remember: rememberMe }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
            navigate("/");
        },
    });

    const handleSubmitForm = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        mutate();
    };

    const errorMessage = axios.isAxiosError<LoginErrorResponse>(error)
        ? error.response?.data.message || "Connection error"
        : error
          ? "Something went wrong"
          : null;

    const fields: AuthFormField[] = [
        {
            id: "name",
            label: "Name",
            value: name,
            type: "text",
            autoComplete: "username",
            placeholder: "Your name",
            icon: UserRound,
            autoFocus: true,
            onChange: setName,
        },
        {
            id: "password",
            label: "Password",
            value: password,
            type: "password",
            autoComplete: "current-password",
            placeholder: "Enter password",
            icon: LockKeyhole,
            onChange: setPassword,
        },
    ];

    return (
        <AuthForm
            title="Sign in"
            description="Use your credentials to access your FleetFlow account."
            fields={fields}
            submitLabel="Login"
            pendingLabel="Logging in..."
            isPending={isPending}
            isSubmitDisabled={!name || !password}
            errorMessage={errorMessage}
            footerText="Don't have an account?"
            footerLinkLabel="Create account"
            footerLinkTo="/registration"
            onSubmit={handleSubmitForm}
            rememberMe={rememberMe}
            onRememberMeChange={setRememberMe}
        />
    );
};
