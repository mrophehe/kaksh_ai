'use client';

import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useI18n } from '@/lib/hooks/use-i18n';
import { PDF_PROVIDERS } from '@/lib/pdf/constants';
import type { PDFProviderId } from '@/lib/pdf/types';
import { CheckCircle2 } from 'lucide-react';

/**
 * Get display label for feature
 */
function getFeatureLabel(feature: string, t: (key: string) => string): string {
  const labels: Record<string, string> = {
    text: t('settings.featureText'),
    images: t('settings.featureImages'),
    tables: t('settings.featureTables'),
    formulas: t('settings.featureFormulas'),
    'layout-analysis': t('settings.featureLayoutAnalysis'),
    metadata: t('settings.featureMetadata'),
  };
  return labels[feature] || feature;
}

interface PDFSettingsProps {
  selectedProviderId: PDFProviderId;
}

export function PDFSettings({ selectedProviderId }: PDFSettingsProps) {
  const { t } = useI18n();

  const pdfProvider = PDF_PROVIDERS[selectedProviderId];
  const providerDescriptions: Record<PDFProviderId, string> = {
    unpdf:
      'Best for mixed PDFs where you want text plus extracted images for slide generation and visual references.',
    'pdf-parse':
      'Best for straightforward text extraction. It is lighter, but it does not extract PDF images in this app.',
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="rounded-lg border border-border/50 bg-muted/20 p-3 text-sm text-muted-foreground">
        <span className="font-medium text-foreground">{pdfProvider.name}</span> runs locally and
        does not require a separate API key or base URL. {providerDescriptions[selectedProviderId]}
      </div>

      {/* Features List */}
      <div className="space-y-2">
        <Label className="text-sm">{t('settings.pdfFeatures')}</Label>
        <div className="flex flex-wrap gap-2">
          {pdfProvider.features.map((feature) => (
            <Badge key={feature} variant="secondary" className="font-normal">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              {getFeatureLabel(feature, t)}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
