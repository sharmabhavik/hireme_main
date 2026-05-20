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
        <section className="hire-section-band">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="mb-6 text-center sm:mb-8">
                    <h2 className="text-xl font-bold text-foreground sm:text-2xl">Browse by role</h2>
                    <p className="mt-1 text-sm text-muted-foreground sm:text-base">Jump into a category—results open on the browse page.</p>
                </div>
                <Carousel className="w-full max-w-3xl mx-auto">
                    <CarouselContent className="-ml-2 md:-ml-4">
                        {
                            category.map((cat) => (
                                <CarouselItem key={cat} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                                    <Button
                                        onClick={()=>searchJobHandler(cat)}
                                        variant="outline"
                                        className="w-full rounded-full border-border bg-card font-medium text-foreground shadow-sm transition-all hover:border-primary/40 hover:bg-primary/8 hover:text-primary"
                                    >
                                        {cat}
                                    </Button>
                                </CarouselItem>
                            ))
                        }
                    </CarouselContent>
                    <CarouselPrevious className="border-border" />
                    <CarouselNext className="border-border" />
                </Carousel>
            </div>
        </section>
    )
}

export default CategoryCarousel
