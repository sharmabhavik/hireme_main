import React from 'react'
import LatestJobCards from './LatestJobCards';
import { useSelector } from 'react-redux';

const LatestJobs = () => {
    const {allJobs} = useSelector(store=>store.job);

    return (
        <section className='hire-section py-12 sm:py-14 md:py-16 lg:py-20'>
            <div className="mb-8 text-center sm:mb-10 md:text-left">
                <h2 className='text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl'>
                    Fresh <span className="hire-gradient-text">picks</span> for you
                </h2>
                <p className="mx-auto mt-2 max-w-2xl text-muted-foreground md:mx-0">
                    Recently posted roles from teams that are hiring now. Tap a card to see the full description.
                </p>
            </div>
            <div className='hire-grid-jobs'>
                {
                    allJobs.length <= 0 ? (
                        <div className="hire-empty-state col-span-full">
                            <p className="font-medium text-foreground">No openings yet</p>
                            <p className="mt-1 text-sm">Check back soon—or ask a recruiter to post a role on HireMe.</p>
                        </div>
                    ) : allJobs?.slice(0,6).map((job) => <LatestJobCards key={job._id} job={job}/>)
                }
            </div>
        </section>
    )
}

export default LatestJobs
