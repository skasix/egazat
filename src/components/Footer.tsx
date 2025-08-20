interface FooterProps {
  language?: string;
}

export const Footer = ({ language = 'en' }: FooterProps) => {
  const isArabic = language === 'ar';
  
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          {/* Main Title */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <h3 className="text-xl font-bold text-foreground">
              {isArabic 
                ? '🌍 العطل الرسمية العربية - دليلك الشامل للعطل الرسمية في الشرق الأوسط'
                : '🌍 Arab Public Holidays - Your Complete Guide to Middle East Public Holidays'
              }
            </h3>
          </div>
          
          {/* Description */}
          <p className="text-muted-foreground max-w-4xl mx-auto mb-6 leading-relaxed">
            {isArabic 
              ? 'معلومات شاملة ومحدثة حول العطل الرسمية والأيام الوطنية والمناسبات الدينية في جميع دول الجامعة العربية. خطط لرحلاتك واجتماعات العمل والمناسبات المهمة بثقة باستخدام تقاويم العطل الدقيقة.'
              : 'Comprehensive and up-to-date information about public holidays, national days, and religious observances across all Arab League countries. Plan your travels, business meetings, and important events with confidence using our accurate holiday calendars.'
            }
          </p>
          
          {/* Copyright */}
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              {isArabic 
                ? '© 2025 العطل الرسمية العربية. جميع الحقوق محفوظة. | معلومات العطل الرسمية لأغراض التخطيط والمرجع.'
                : '© 2025 Arab Public Holidays. All rights reserved. | Official holiday information for planning and reference purposes.'
              }
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};