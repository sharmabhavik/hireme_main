import React from 'react'
import LatestJobCards from './LatestJobCards';
import { useSelector } from 'react-redux';

const LatestJobs = () => {
    const {allJobs} = useSelector(store=>store.job);

    return (
        <section className='mx-auto max-w-7xl px-4 py-16 sm:px-6'>
            <div className="mb-10 text-center sm:text-left">
                <h2 className='text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl'>
                    Fresh <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">picks</span> for you
                </h2>
                <p className="mt-2 max-w-2xl text-slate-600">
                    Recently posted roles from teams that are hiring now. Tap a card to see the full description.
                </p>
            </div>
            <div className='grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3'>
                {
                    allJobs.length <= 0 ? (
                        <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white/80 py-16 text-center text-slate-500">
                            <p className="font-medium text-slate-700">No openings yet</p>
                            <p className="mt-1 text-sm">Check back soon—or ask a recruiter to post a role on HireMe.</p>
                        </div>
                    ) : allJobs?.slice(0,6).map((job) => <LatestJobCards key={job._id} job={job}/>)
                }
            </div>
        </section>
    )
}

export default LatestJobs
