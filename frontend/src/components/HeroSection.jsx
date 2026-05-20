import React, { useState } from 'react'
import { Button } from './ui/button'
import { Search } from 'lucide-react'
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
    const [query, setQuery] = useState("");
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const searchJobHandler = () => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    }

    return (
        <section className="hire-hero-gradient px-4 pb-16 pt-10 sm:pt-14">
            <div className='mx-auto flex max-w-3xl flex-col gap-6 text-center'>
                <span className="mx-auto inline-flex items-center rounded-full border border-emerald-200/80 bg-white/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-800 shadow-sm">
                    Smart hiring starts here
                </span>
                <h1 className='text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl sm:leading-tight'>
                    Land the role that{' '}
                    <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        fits you
                    </span>
                    —not the other way around
                </h1>
                <p className="mx-auto max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                    Search thousands of openings, filter by what matters, and apply with a profile recruiters actually read.
                </p>
                <div className='mx-auto flex w-full max-w-xl items-center gap-0 overflow-hidden rounded-full border border-slate-200/90 bg-white pl-4 shadow-lg shadow-slate-200/50 ring-1 ring-slate-100'>
                    <input
                        type="text"
                        placeholder='Role, skill, or company…'
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && searchJobHandler()}
                        className='min-w-0 flex-1 border-none bg-transparent py-3.5 text-sm text-slate-800 outline-none placeholder:text-slate-400'
                    />
                    <Button
                        type="button"
                        onClick={searchJobHandler}
                        className="h-12 shrink-0 rounded-none rounded-r-full bg-emerald-600 px-6 text-white hover:bg-emerald-700"
                    >
                        <Search className='h-5 w-5' />
                    </Button>
                </div>
            </div>
        </section>
    )
}

export default HeroSection
