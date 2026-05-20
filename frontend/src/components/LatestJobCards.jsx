import React from 'react'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'

const LatestJobCards = ({job}) => {
    const navigate = useNavigate();
    return (
        <article
            onClick={()=> navigate(`/description/${job._id}`)}
            className='group flex cursor-pointer flex-col rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/10'
        >
            <div>
                <h3 className='font-semibold text-lg text-slate-900'>{job?.company?.name}</h3>
                <p className='text-sm text-slate-500'>{job?.location || 'India'}</p>
            </div>
            <div className="mt-3 flex-1">
                <h4 className='font-bold text-lg leading-snug text-slate-900'>{job?.title}</h4>
                <p className='mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600'>{job?.description}</p>
            </div>
            <div className='mt-5 flex flex-wrap items-center gap-2'>
                <Badge className='border-0 bg-emerald-50 font-semibold text-emerald-800' variant="secondary">{job?.position} open</Badge>
                <Badge className='border-0 bg-amber-50 font-semibold text-amber-900' variant="secondary">{job?.jobType}</Badge>
                <Badge className='border-0 bg-slate-100 font-semibold text-slate-800' variant="secondary">{job?.salary} LPA</Badge>
            </div>
        </article>
    )
}

export default LatestJobCards
