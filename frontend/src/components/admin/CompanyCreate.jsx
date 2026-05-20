import React, { useState } from 'react'
import Navbar from '../shared/Navbar'
import Footer from '../shared/Footer'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { COMPANY_API_END_POINT } from '@/utils/constant'
import { toast } from 'sonner'
import { useDispatch } from 'react-redux'
import { setSingleCompany } from '@/redux/companySlice'

const CompanyCreate = () => {
    const navigate = useNavigate();
    const [companyName, setCompanyName] = useState();
    const dispatch = useDispatch();
    const registerNewCompany = async () => {
        try {
            const res = await axios.post(`${COMPANY_API_END_POINT}/register`, {companyName}, {
                headers:{
                    'Content-Type':'application/json'
                },
                withCredentials:true
            });
            if(res?.data?.success){
                dispatch(setSingleCompany(res.data.company));
                toast.success(res.data.message);
                const companyId = res?.data?.company?._id;
                navigate(`/admin/companies/${companyId}`);
            }
        } catch (error) {
            console.error(error);
        }
    }
    return (
        <div className="hire-page">
            <Navbar />
            <div className='mx-auto max-w-4xl px-4 py-10 sm:px-6'>
                <div className='hire-card-padded'>
                    <h1 className='font-bold text-2xl text-foreground'>Name your company</h1>
                    <p className='mt-2 text-muted-foreground'>You can update branding and details on the next step.</p>

                    <Label className="mt-8 block">Company name</Label>
                    <Input
                        type="text"
                        className="my-2"
                        placeholder="Acme Labs, TechNova…"
                        onChange={(e) => setCompanyName(e.target.value)}
                    />
                    <div className='mt-8 flex flex-wrap items-center gap-3'>
                        <Button variant="outline" className="border-border" onClick={() => navigate("/admin/companies")}>Cancel</Button>
                        <Button onClick={registerNewCompany}>Continue</Button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default CompanyCreate
