import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Footer } from "@/components/Footer";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import { CountryPage } from "./pages/CountryPage";
import NotFound from "./pages/NotFound";

const AppContent = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/');
  const language = pathSegments[1]?.replace('.html', '') || 'en';
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
         <Routes>
           <Route path="/" element={<Navigate to="/en" replace />} />
           
           <Route path="/:lang" element={<Index />} />
           <Route path="/:lang.html" element={<Index />} />
           <Route path="/:lang/country/:countryCode/:year" element={<CountryPage />} />
           <Route path="/:lang/country/:countryCode/:year.html" element={<CountryPage />} />
           {/* Legacy routes for backward compatibility */}
           <Route path="/country/:countryCode/:year" element={<CountryPage />} />
           <Route path="/country/:countryCode/:year.html" element={<CountryPage />} />
           {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
           <Route path="*" element={<NotFound />} />
         </Routes>
      </div>
      <Footer language={language} />
      <ScrollToTop />
    </div>
  );
};

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
