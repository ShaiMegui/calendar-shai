import { useState, useEffect } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useStore } from "@/store/store";
import { supabase } from "@/lib/supabase";

interface ShareLinkProps {
  slug: string;
  username?: string;
  className?: string;
}

export function ShareLink({ slug, username: propUsername, className }: ShareLinkProps) {
  const [copied, setCopied] = useState(false);
  const [resolvedUsername, setResolvedUsername] = useState<string | undefined>(propUsername);
  const [isLoading, setIsLoading] = useState(!propUsername);
  
  // Obtenir l'utilisateur depuis le store
  const user = useStore(state => state.user);
  
  useEffect(() => {
    // Si le username est déjà disponible, utiliser celui-là
    if (propUsername) {
      setResolvedUsername(propUsername);
      setIsLoading(false);
      return;
    }
    
    // Si le username est dans le store et qu'il n'est pas encore résolu, l'utiliser
    if (user?.username && !resolvedUsername) {
      setResolvedUsername(user.username);
      setIsLoading(false);
      return;
    }
    
    // Si nous avons un ID utilisateur mais pas de username, essayer de le récupérer de Supabase
    if (user?.id && !resolvedUsername && !propUsername) {
      const fetchUsername = async () => {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('username')
            .eq('id', user.id)
            .single();
            
          if (error) throw error;
          
          if (data?.username) {
            setResolvedUsername(data.username);
          }
        } catch (error) {
          console.error("Error fetching username:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchUsername();
    } else if (!user?.id && !resolvedUsername) {
      // Si nous n'avons ni utilisateur ni username résolu, arrêter le chargement
      setIsLoading(false);
    }
  }, [propUsername, user, resolvedUsername]);
  
  // Construire l'URL de partage uniquement si nous avons à la fois username et slug
  const shareUrl = resolvedUsername && slug 
    ? `${window.location.origin}/${resolvedUsername}/${slug}`.replace(/([^:]\/)\/+/g, "$1")
    : "";
  
  const copyToClipboard = async () => {
    if (!shareUrl) {
      toast.error("Unable to generate sharing link");
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
  };
  
  // Afficher l'état de chargement si l'URL n'est pas prête
  if (isLoading) {
    return (
      <div 
        className={cn(
          "flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200",
          className
        )}
      >
        <div className="flex-1 h-5 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }
  
  // Afficher un message si nous ne pouvons pas générer l'URL (pas de username résolu)
  if (!shareUrl) {
    return (
      <div 
        className={cn(
          "flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200",
          className
        )}
      >
        <span className="flex-1 text-sm text-gray-500 italic">Unable to generate sharing link</span>
      </div>
    );
  }
  
  return (
    <div 
      className={cn(
        "flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200",
        className
      )}
    >
      <input
        type="text"
        value={shareUrl}
        readOnly
        className="flex-1 bg-transparent border-none text-sm text-gray-600 focus:outline-none truncate"
      />
      <button
        onClick={copyToClipboard}
        className="p-1 hover:bg-gray-200 rounded-md transition-colors"
        title="Copy link"
        aria-label={copied ? "Copied" : "Copy link"}
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Copy className="w-4 h-4 text-gray-600" />
        )}
      </button>
    </div>
  );
}