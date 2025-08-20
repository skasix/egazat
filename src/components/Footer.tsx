export const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          {/* Main Title */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <h3 className="text-xl font-bold text-foreground">
              🌍 Arab Public Holidays - Your Complete Guide to Middle East Public Holidays
            </h3>
          </div>
          
          {/* Description */}
          <p className="text-muted-foreground max-w-4xl mx-auto mb-6 leading-relaxed">
            Comprehensive and up-to-date information about public holidays, national days, and religious observances across all Arab League countries. Plan your travels, business meetings, and important events with confidence using our accurate holiday calendars.
          </p>
          
          {/* Copyright */}
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              © 2025 Arab Public Holidays. All rights reserved. | Official holiday information for planning and reference purposes.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};