import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

export const Contact = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    toast({
      title: t('contact.success_title'),
      description: t('contact.success_message'),
    });
  };

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl border border-primary/20">
            <div className="p-4 bg-primary/10 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">
              {t('contact.success_title')}
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              {t('contact.success_message')}
            </p>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{t('contact.response_24h')}</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <Phone className="w-4 h-4" />
                <span>{t('contact.demo_30min')}</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>{t('contact.needs_analysis')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
            {t('contact.title')}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulaire de contact */}
          <div className="lg:col-span-2">
            <Card className="p-8 bg-gradient-to-br from-background to-secondary/10 border border-primary/10">
              <h2 className="text-2xl font-semibold text-foreground mb-6">
                {t('contact.form_title')}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t('contact.first_name')} *</Label>
                    <Input id="firstName" placeholder={t('contact.first_name')} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t('contact.last_name')} *</Label>
                    <Input id="lastName" placeholder={t('contact.last_name')} required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">{t('contact.email')} *</Label>
                  <Input id="email" type="email" placeholder="votre.email@entreprise.com" required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">{t('contact.phone')}</Label>
                  <Input id="phone" type="tel" placeholder="+216 93 460 745" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">{t('contact.company')} *</Label>
                  <Input id="company" placeholder={t('contact.company')} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sector">{t('contact.sector')}</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={t('contact.select_sector')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="industry">{t('contact.sectors.industry')}</SelectItem>
                        <SelectItem value="services">{t('contact.sectors.services')}</SelectItem>
                        <SelectItem value="retail">{t('contact.sectors.retail')}</SelectItem>
                        <SelectItem value="transport">{t('contact.sectors.transport')}</SelectItem>
                        <SelectItem value="construction">{t('contact.sectors.construction')}</SelectItem>
                        <SelectItem value="agriculture">{t('contact.sectors.agriculture')}</SelectItem>
                        <SelectItem value="finance">{t('contact.sectors.finance')}</SelectItem>
                        <SelectItem value="tech">{t('contact.sectors.tech')}</SelectItem>
                        <SelectItem value="other">{t('contact.sectors.other')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size">{t('contact.company_size')}</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder={t('contact.select_size')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1-10">{t('contact.company_sizes.1-10')}</SelectItem>
                        <SelectItem value="11-50">{t('contact.company_sizes.11-50')}</SelectItem>
                        <SelectItem value="51-200">{t('contact.company_sizes.51-200')}</SelectItem>
                        <SelectItem value="201-1000">{t('contact.company_sizes.201-1000')}</SelectItem>
                        <SelectItem value="1000+">{t('contact.company_sizes.1000+')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="needs">{t('contact.needs')}</Label>
                  <Textarea 
                    id="needs" 
                    placeholder={t('contact.needs_placeholder')}
                    className="min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeline">{t('contact.timeline')}</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder={t('contact.timeline_placeholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">{t('contact.timelines.immediate')}</SelectItem>
                      <SelectItem value="1-3months">{t('contact.timelines.1-3months')}</SelectItem>
                      <SelectItem value="3-6months">{t('contact.timelines.3-6months')}</SelectItem>
                      <SelectItem value="6-12months">{t('contact.timelines.6-12months')}</SelectItem>
                      <SelectItem value="exploration">{t('contact.timelines.exploration')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  <Send className="w-4 h-4 mr-2" />
                  {t('contact.submit')}
                </Button>
              </form>
            </Card>
          </div>

          {/* Informations et avantages */}
          <div className="space-y-6">
            {/* Contact direct */}
            <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {t('contact.contact_info')}
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t('auth.email')}</p>
                    <p className="text-sm text-muted-foreground">Carbontrack2025@protonmail.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t('contact.phone')}</p>
                    <p className="text-sm text-muted-foreground">+216 93 460 745</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Adresse</p>
                    <p className="text-sm text-muted-foreground">Avenue Habib Bourguiba - 2080 Ariana</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Ce que vous obtiendrez */}
            <Card className="p-6 bg-gradient-to-br from-accent/5 to-secondary/5 border border-accent/10">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {t('contact.what_you_get')}
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{t('contact.demo_personalized')}</p>
                    <p className="text-xs text-muted-foreground">{t('contact.demo_personalized_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{t('contact.data_analysis')}</p>
                    <p className="text-xs text-muted-foreground">{t('contact.data_analysis_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{t('contact.custom_roadmap')}</p>
                    <p className="text-xs text-muted-foreground">{t('contact.custom_roadmap_desc')}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{t('contact.free_trial')}</p>
                    <p className="text-xs text-muted-foreground">{t('contact.free_trial_desc')}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Temps de réponse */}
            <Card className="p-6 bg-gradient-to-br from-success/5 to-primary/5 border border-success/20">
              <div className="text-center">
                <Clock className="w-12 h-12 text-success mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {t('contact.response_guaranteed')}
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {t('contact.within_24h')}
                </p>
                <Badge variant="default" className="text-lg font-bold px-4 py-2">
                  {t('contact.24_hours')}
                </Badge>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};