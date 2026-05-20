import React, { useEffect, useState } from 'react'
import Navbar from '../shared/Navbar'
import Footer from '../shared/Footer'
import BrandLogo from '../shared/BrandLogo'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { USER_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch, useSelector } from 'react-redux'
import { setLoading, setUser } from '@/redux/authSlice'
import { Loader2 } from 'lucide-react'

const Login = () => {
    const [input, setInput] = useState({
        email: "",
        password: "",
        role: "",
    });
    const { loading,user } = useSelector(store => store.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        setInput({ ...input, [e.target.name]: e.target.value });
    }

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!input.email?.trim() || !input.password) {
            toast.error("Please enter email and password.");
            return;
        }
        if (!input.role) {
            toast.error("Please select Student or Recruiter.");
            return;
        }
        try {
            dispatch(setLoading(true));
            const res = await axios.post(`${USER_API_END_POINT}/login`, input, {
                headers: {
                    "Content-Type": "application/json"
                },
                withCredentials: true,
            });
            if (res.data.success) {
                dispatch(setUser(res.data.user));
                navigate("/");
                toast.success(res.data.message);
            }
        } catch (error) {
            console.error(error);
            const msg =
                error.response?.data?.message ||
                error.message ||
                "Could not reach the server. Is the API running on port 8000?";
            toast.error(msg);
        } finally {
            dispatch(setLoading(false));
        }
    }
    useEffect(() => {
        dispatch(setLoading(false));
    }, [dispatch]);

    useEffect(() => {
        if (user) {
            navigate("/");
        }
    }, [user, navigate]);
    return (
        <div className="hire-page hire-auth-bg">
            <Navbar />
            <div className='mx-auto flex max-w-7xl flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6 sm:py-12'>
                <div className="mb-6 text-center sm:mb-8">
                    <BrandLogo size="lg" />
                    <p className="mt-3 text-muted-foreground">Welcome back. Sign in to continue.</p>
                </div>
                <form onSubmit={submitHandler} className='hire-card w-full max-w-md p-6 shadow-lg sm:p-8'>
                    <h1 className='font-bold text-xl text-foreground'>Log in</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Use the email and role you registered with.</p>
                    <div className='my-4'>
                        <Label>Email</Label>
                        <Input
                            type="email"
                            value={input.email}
                            name="email"
                            onChange={changeEventHandler}
                            placeholder="you@example.com"
                            className="mt-1.5"
                        />
                    </div>

                    <div className='my-4'>
                        <Label>Password</Label>
                        <Input
                            type="password"
                            value={input.password}
                            name="password"
                            onChange={changeEventHandler}
                            placeholder="••••••••"
                            className="mt-1.5"
                        />
                    </div>
                    <div className="my-6" role="radiogroup" aria-label="Account type">
                        <p className="mb-3 text-sm font-medium text-foreground">I am a</p>
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center space-x-2">
                                <Input
                                    id="login-role-student"
                                    type="radio"
                                    name="role"
                                    value="student"
                                    checked={input.role === 'student'}
                                    onChange={changeEventHandler}
                                    className="cursor-pointer"
                                />
                                <Label htmlFor="login-role-student">Student</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Input
                                    id="login-role-recruiter"
                                    type="radio"
                                    name="role"
                                    value="recruiter"
                                    checked={input.role === 'recruiter'}
                                    onChange={changeEventHandler}
                                    className="cursor-pointer"
                                />
                                <Label htmlFor="login-role-recruiter">Recruiter</Label>
                            </div>
                        </div>
                    </div>
                    {
                        loading ? <Button className="w-full my-2" type="button"> <Loader2 className='mr-2 h-4 w-4 animate-spin' /> Please wait </Button> : <Button type="submit" className="w-full my-2">Log in</Button>
                    }
                    <p className='text-sm text-center text-muted-foreground mt-4'>
                        Don&apos;t have an account?{' '}
                        <Link to="/signup" className='hire-link'>Join HireMe</Link>
                    </p>
                </form>
            </div>
            <Footer />
        </div>
    )
}

export default Login
