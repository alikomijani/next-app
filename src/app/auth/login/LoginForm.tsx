"use client";

import { useForm } from "react-hook-form";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Stack,
} from "@mui/material";
import Link from "next/link";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const body = await res.json();
    console.log(body);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Box
        sx={{
          p: 4,
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: "white",
        }}
      >
        <Typography variant="h5" mb={3} textAlign="center">
          ورود به حساب
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <TextField
              label="ایمیل"
              type="email"
              {...register("email", {
                required: "ایمیل الزامی است",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "ایمیل معتبر نیست",
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
              fullWidth
            />

            <TextField
              label="رمز عبور"
              type="password"
              {...register("password", {
                required: "رمز عبور الزامی است",
                minLength: { value: 6, message: "حداقل ۶ کاراکتر" },
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
              fullWidth
            />
            <Link href={"/auth/register"}>حساب کاربری ندارید؟</Link>

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isSubmitting}
            >
              ورود
            </Button>
          </Stack>
        </form>
      </Box>
    </Container>
  );
}
