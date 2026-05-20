import React from 'react'
import { Badge } from './ui/badge'
import { useNavigate } from 'react-router-dom'

const LatestJobCards = ({job}) => {
    const navigate = useNavigate();
    return (
        <article
            onClick={()=> navigate(`/description/${job._id}`)}
            className='hire-job-card group cursor-pointer hover:-translate-y-0.5 hover:shadow-lg'
        >
            <div>
                <h3 className='font-semibold text-lg text-foreground'>{job?.company?.name}</h3>
                <p className='text-sm text-muted-foreground'>{job?.location || 'India'}</p>
            </div>
            <div className="mt-3 flex-1">
                <h4 className='font-bold text-lg leading-snug text-foreground'>{job?.title}</h4>
                <p className='mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground'>{job?.description}</p>
            </div>
            <div className='mt-5 flex flex-wrap items-center gap-2'>
                <Badge className='hire-badge-primary' variant="secondary">{job?.position} open</Badge>
                <Badge className='hire-badge-warm' variant="secondary">{job?.jobType}</Badge>
                <Badge className='hire-badge-muted' variant="secondary">{job?.salary} LPA</Badge>
            </div>
        </article>
    )
}

export default LatestJobCards
