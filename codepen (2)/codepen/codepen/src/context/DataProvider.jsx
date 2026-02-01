import { createContext, useState } from "react";

export const DataContext = createContext();

// Create the provider component
const DataProvider = ({ children }) => {
    
    const [html, setHtml] = useState('');
    const [css, setCss] = useState('');
    const [js,setJs] = useState('');

    return (
        <DataContext.Provider 
        value={{ 
            html, 
            setHtml,
            css,
            setCss,
            js,
            setJs
        }}>
            {children}
        </DataContext.Provider>
    );
};

export default DataProvider;



// sk-0EuGxi_NR6_4hVkONc608i4dGB6s3CqjIUMNm3zQ28T3BlbkFJca4emIhMnBOJGOLswtoB19WVHpeoogPG-RKuTYLZcA