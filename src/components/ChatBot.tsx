import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, X, Leaf, Calculator, BarChart3, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
}

const ChatBot = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Message d'accueil initial
      const welcomeMessage: Message = {
        id: '1',
        text: "Bonjour ! Je suis votre assistant carbone. Je peux vous aider avec le suivi et la réduction de votre empreinte carbone. Comment puis-je vous aider aujourd'hui ?",
        isBot: true,
        timestamp: new Date(),
        suggestions: [
          "Comment calculer mon empreinte carbone ?",
          "Quelles sont les actions les plus efficaces ?",
          "Comment suivre mes progrès ?",
          "Qu'est-ce que le CBAM ?"
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  const getResponseToQuestion = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('calculer') || lowerQuestion.includes('calcul')) {
      return "Pour calculer votre empreinte carbone, utilisez notre calculateur avancé. Il prend en compte vos émissions directes (Scope 1), indirectes énergétiques (Scope 2) et autres émissions indirectes (Scope 3). Vous pouvez accéder au calculateur depuis le menu principal.";
    }
    
    if (lowerQuestion.includes('action') || lowerQuestion.includes('réduction') || lowerQuestion.includes('diminuer')) {
      return "Les actions les plus efficaces pour réduire votre empreinte carbone incluent : l'amélioration de l'efficacité énergétique, la transition vers les énergies renouvelables, l'optimisation des transports, et la sensibilisation des équipes. Notre module Actions vous aide à planifier et suivre ces initiatives.";
    }
    
    if (lowerQuestion.includes('suivre') || lowerQuestion.includes('progrès') || lowerQuestion.includes('évolution')) {
      return "Vous pouvez suivre vos progrès via notre tableau de bord qui affiche l'évolution de vos émissions, le statut de vos actions de réduction, et des graphiques détaillés. Les rapports automatiques vous permettent de mesurer l'efficacité de vos initiatives.";
    }
    
    if (lowerQuestion.includes('cbam') || lowerQuestion.includes('frontière') || lowerQuestion.includes('carbone')) {
      return "Le CBAM (Carbon Border Adjustment Mechanism) est le mécanisme européen d'ajustement carbone aux frontières. Il vise à protéger l'industrie européenne contre la concurrence déloyale de pays avec des normes climatiques moins strictes. Notre module CBAM vous aide à calculer et déclarer vos émissions.";
    }
    
    if (lowerQuestion.includes('scope') || lowerQuestion.includes('catégorie')) {
      return "Les émissions sont classées en 3 scopes : Scope 1 (émissions directes de votre organisation), Scope 2 (émissions indirectes liées à l'énergie), et Scope 3 (autres émissions indirectes de la chaîne de valeur). Cette classification aide à identifier les sources d'émissions et prioriser les actions.";
    }
    
    if (lowerQuestion.includes('rapport') || lowerQuestion.includes('reporting')) {
      return "Notre plateforme génère automatiquement des rapports conformes aux standards internationaux (GRI, CDP, TCFD). Vous pouvez exporter vos données en PDF ou Excel, et programmer des rapports automatiques pour vos parties prenantes.";
    }
    
    if (lowerQuestion.includes('objectif') || lowerQuestion.includes('cible') || lowerQuestion.includes('target')) {
      return "Définir des objectifs de réduction claire est essentiel. Nous recommandons l'approche Science Based Targets (SBTi) avec des objectifs alignés sur l'Accord de Paris. Notre plateforme vous aide à définir, suivre et atteindre vos objectifs climatiques.";
    }
    
    if (lowerQuestion.includes('coût') || lowerQuestion.includes('prix') || lowerQuestion.includes('budget')) {
      return "Le coût des actions climatiques varie selon leur nature. Notre plateforme estime le coût de chaque action et calcule le retour sur investissement. Investir dans la réduction carbone est souvent rentable à moyen terme grâce aux économies d'énergie et à l'évitement des taxes carbone.";
    }
    
    // Réponse par défaut
    return "C'est une excellente question ! Notre plateforme offre des outils complets pour le suivi et la réduction de l'empreinte carbone. Puis-je vous orienter vers une section spécifique ? Vous pouvez explorer le calculateur, le tableau de bord, ou le module d'actions de réduction.";
  };

  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || inputValue.trim();
    if (!text) return;

    console.log('[ChatBot] send', { text });

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simuler un délai de réponse
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getResponseToQuestion(text),
        isBot: true,
        timestamp: new Date(),
        suggestions: [
          "Comment optimiser mes émissions Scope 3 ?",
          "Quels sont les indicateurs clés à suivre ?",
          "Comment impliquer mes équipes ?",
          "Autres questions..."
        ]
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    console.log('[ChatBot] suggestion click', suggestion);
    handleSendMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Bouton flottant */}
      {!isOpen && (
        <Button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg z-50 transition-all hover:scale-110"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Interface de chat */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col border-2 border-primary/20">
          <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Leaf className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">Assistant Carbone</CardTitle>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-primary-foreground hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    <div className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                      <div className={`flex items-start gap-2 max-w-[85%] ${message.isBot ? '' : 'flex-row-reverse'}`}>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={message.isBot ? 'bg-primary text-primary-foreground' : 'bg-secondary'}>
                            {message.isBot ? <Leaf className="h-4 w-4" /> : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`rounded-lg p-3 ${
                          message.isBot 
                            ? 'bg-muted text-muted-foreground' 
                            : 'bg-primary text-primary-foreground'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                        </div>
                      </div>
                    </div>

                    {/* Suggestions */}
                    {message.suggestions && (
                      <div className="relative z-10 flex flex-wrap gap-2 ml-10">
                        {message.suggestions.map((suggestion, index) => (
                          <button
                            type="button"
                            key={`suggestion-${message.id}-${index}`}
                            className="focus:outline-none"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSuggestionClick(suggestion);
                            }}
                          >
                            <Badge
                              variant="outline"
                              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs select-none"
                            >
                              {suggestion}
                            </Badge>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Indicateur de frappe */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Leaf className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex space-x-1">
                          <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"></div>
                          <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            {/* Zone de saisie */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Posez votre question..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isTyping}
                  size="icon"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default ChatBot;