import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type {
  LoginRequest,
  RegisterRequest,
  UpdateUserRequest,
  UserResponse,
} from "../api/generated";
import { loginSchema, profileSchema, registerSchema } from "../validation";
import { FormField } from "./form-validation";

export function AuthForm({
  registering,
  onLogin,
  onRegister,
}: {
  registering: boolean;
  onLogin: (data: LoginRequest) => void;
  onRegister: (data: RegisterRequest) => void;
}) {
  return (
    <section class="card">
      <div class="card-body">
        <h2 class="h5 card-title">
          {registering ? "Create an account" : "Sign in"}
        </h2>
        <p class="text-body-secondary small">
          Browse projects publicly. Sign in to manage your own.
        </p>
        <p>
          {registering ? (
            <a href="/login">Already have an account? Sign in</a>
          ) : (
            <a href="/register">Create an account</a>
          )}
        </p>
        {registering ? (
          <RegistrationForm onSubmit={onRegister} />
        ) : (
          <LoginForm onSubmit={onLogin} />
        )}
      </div>
    </section>
  );
}

function LoginForm({ onSubmit }: { onSubmit: (data: LoginRequest) => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <FormField
        id="auth-email"
        label="Email"
        registration={register("email")}
        error={errors.email?.message}
        type="email"
        autoComplete="email"
        required
      />
      <FormField
        id="auth-password"
        label="Password"
        registration={register("password")}
        error={errors.password?.message}
        type="password"
        autoComplete="current-password"
        help="Use at least 12 characters and no more than 72 UTF-8 bytes."
        required
      />
      <button type="submit" class="btn btn-primary">
        Sign in
      </button>
    </form>
  );
}

function RegistrationForm({
  onSubmit,
}: {
  onSubmit: (data: RegisterRequest) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", age: "", email: "", password: "" },
  });

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)}>
      <FormField
        id="auth-name"
        label="Name"
        registration={register("name")}
        error={errors.name?.message}
        autoComplete="name"
        required
      />
      <FormField
        id="auth-age"
        label="Age"
        registration={register("age")}
        error={errors.age?.message}
        type="number"
        min={0}
        max={130}
        step={1}
        required
      />
      <FormField
        id="auth-email"
        label="Email"
        registration={register("email")}
        error={errors.email?.message}
        type="email"
        autoComplete="email"
        required
      />
      <FormField
        id="auth-password"
        label="Password"
        registration={register("password")}
        error={errors.password?.message}
        type="password"
        autoComplete="new-password"
        help="Use at least 12 characters and no more than 72 UTF-8 bytes."
        required
      />
      <button type="submit" class="btn btn-primary">
        Create account
      </button>
    </form>
  );
}

export function ProfileForm({
  user,
  onSave,
}: {
  user: UserResponse;
  onSave: (data: UpdateUserRequest) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      age: String(user.age),
      email: user.email,
    },
  });

  return (
    <form noValidate onSubmit={handleSubmit(onSave)}>
      <FormField
        id="profile-name"
        label="Name"
        registration={register("name")}
        error={errors.name?.message}
        autoComplete="name"
        required
      />
      <FormField
        id="profile-age"
        label="Age"
        registration={register("age")}
        error={errors.age?.message}
        type="number"
        min={0}
        max={130}
        step={1}
        required
      />
      <FormField
        id="profile-email"
        label="Email"
        registration={register("email")}
        error={errors.email?.message}
        type="email"
        autoComplete="email"
        required
      />
      <button type="submit" class="btn btn-primary">
        Save profile
      </button>
    </form>
  );
}
