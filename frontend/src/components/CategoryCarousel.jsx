import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import { Button } from './ui/button';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setSearchedQuery } from '@/redux/jobSlice';

const category = [
    "Frontend Developer",
    "Backend Developer",
    "Data Science",
    "Graphic Designer",
    "FullStack Developer"
]

const CategoryCarousel = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const searchJobHandler = (query) => {
        dispatch(setSearchedQuery(query));
        navigate("/browse");
    }

    return (
        <section className="border-y border-slate-100 bg-white/60 py-12 backdrop-blur-sm">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-slate-900">Browse by role</h2>
                    <p className="mt-1 text-slate-600">Jump into a category—results open on the browse page.</p>
                </div>
                <Carousel className="w-full max-w-3xl mx-auto">
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {
                            category.map((cat) => (
                                <CarouselItem key={cat} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                                    <Button
                                        onClick={()=>searchJobHandler(cat)}
                                        variant="outline"
                                        className="w-full rounded-full border-emerald-200/80 bg-white font-medium text-slate-700 shadow-sm transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-900"
                                    >
                                        {cat}
                                    </Button>
                                </CarouselItem>
                            ))
                        }
                    </CarouselContent>
                    <CarouselPrevious className="border-slate-200" />
                    <CarouselNext className="border-slate-200" />
                </Carousel>
            </div>
        </section>
    )
}

export default CategoryCarousel
