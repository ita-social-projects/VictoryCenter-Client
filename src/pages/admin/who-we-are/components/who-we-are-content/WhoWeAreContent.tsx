import {CategoryBar} from "../../../../../components/admin/category-bar/CategoryBar";
import {useCallback, useEffect, useState} from "react";
import {WhoWeAreApi} from "../../../../../services/api/admin/who-we-are/who-we-are-api";
import {WhoWeAreCategory} from "../../../../../types/admin/who-we-are";
import {useAdminClient} from "../../../../../hooks/admin/use-admin-client/useAdminClient";
import axios from "axios";
import  './who-we-are-content.scss'

interface ErrorState {
    message: string | null;
    type: 'categories' | 'entity' | null;
}
export const WhoWeAreContent = () => {

    const client = useAdminClient();
    const [categories, setCategories] = useState<WhoWeAreCategory[]>([]);
    const [error, setError] = useState<ErrorState>({ message: null, type: null });
    const [selectedCategory, setSelectedCategory ] = useState<WhoWeAreCategory | null>(null);


    const clearError = useCallback(() => {
        setError({ message: null, type: null });
    }, []);

    const handleCategorySelect = useCallback(
        (category: WhoWeAreCategory) => {
            setSelectedCategory(category);
        }, [clearError, client]);

    const fetchCategories = useCallback(async() => {
        try{
            const fetchedCategories = await WhoWeAreApi.getAll(client);
            if(fetchedCategories.length > 0){
                setCategories(fetchedCategories)
            }
        }
        catch (error: any){
            if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
                return;
            }
        }
    }, [clearError, client]);



    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);
    return(
        <div className = "who-we-are-main-box">
            <CategoryBar<WhoWeAreCategory> categories={categories} selectedCategory={selectedCategory} getCategoryDisplayName={category => category.title} getCategoryKey={category => category.id} onCategorySelect={handleCategorySelect}/>
        </div>
    );
}