import {
    register,
    type RegisterCredentials,
    type ValidationErrorResponse,
} from "@/api/auth";
import { AuthForm, type AuthFormField } from "@/components/Auth/AuthForm";
import { Footer } from "@/components/Footer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { LockKeyhole, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";

export const Register = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const { mutate, isPending, error } = useMutation({
        mutationFn: (data: RegisterCredentials) => register(data),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["currentUser"] });
            navigate("/");
        },
    });

    const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        mutate({
            name,
            password,
            password_confirmation: passwordConfirmation,
        });
    };

    const validationErrors =
        axios.isAxiosError<ValidationErrorResponse>(error) && error.response?.status === 422
            ? error.response.data.errors
            : null;

    const generalErrorMessage =
        error && !validationErrors
            ? axios.isAxiosError<ValidationErrorResponse>(error)
                ? error.response?.data.message || "Connection error"
                : "Something went wrong"
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
            error: validationErrors?.name?.[0],
            autoFocus: true,
            onChange: setName,
        },
        {
            id: "password",
            label: "Password",
            value: password,
            type: "password",
            autoComplete: "new-password",
            placeholder: "Create password",
            icon: LockKeyhole,
            error: validationErrors?.password?.[0],
            onChange: setPassword,
        },
        {
            id: "password_confirmation",
            label: "Confirm password",
            value: passwordConfirmation,
            type: "password",
            autoComplete: "new-password",
            placeholder: "Repeat password",
            icon: LockKeyhole,
            error: validationErrors?.password_confirmation?.[0],
            onChange: setPasswordConfirmation,
        },
    ];

    return (
        <>
            <AuthForm
                title="Create account"
                description="Create your profile to start using FleetFlow."
                fields={fields}
                submitLabel="Register"
                pendingLabel="Creating account..."
                isPending={isPending}
                isSubmitDisabled={!name || !password || !passwordConfirmation}
                errorMessage={generalErrorMessage}
                footerText="Already have an account?"
                footerLinkLabel="Login"
                footerLinkTo="/authorization"
                onSubmit={handleFormSubmit}
            />
            <Footer />
        </>
    );
};
