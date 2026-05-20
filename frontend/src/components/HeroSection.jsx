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
        <section className="hire-hero-gradient px-4 pb-12 pt-8 sm:pb-16 sm:pt-12 md:pt-14">
            <div className='mx-auto flex max-w-3xl flex-col gap-5 text-center sm:gap-6'>
                <span className="hire-pill mx-auto">
                    Smart hiring starts here
                </span>
                <h1 className='text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl sm:leading-tight'>
                    Land the role that{' '}
                    <span className="hire-gradient-text">
                        fits you
                    </span>
                    —not the other way around
                </h1>
                <p className="mx-auto max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                    Search thousands of openings, filter by what matters, and apply with a profile recruiters actually read.
                </p>
                <div className='hire-search-bar mx-auto max-w-xl shadow-md'>
                    <input
                        type="text"
                        placeholder='Role, skill, or company…'
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && searchJobHandler()}
                        className='hire-search-input'
                    />
                    <Button
                        type="button"
                        onClick={searchJobHandler}
                        className="h-11 shrink-0 rounded-none rounded-r-full px-5 sm:h-12 sm:px-6"
                    >
                        <Search className='h-5 w-5' />
                    </Button>
                </div>
            </div>
        </section>
    )
}

export default HeroSection
