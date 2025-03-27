import { Glassmorphism } from "@/components/ui/glassmorphism";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ForumPreviewCardProps {
  themeColor: string;
  primaryFont: string;
  secondaryFont: string;
  headingFontSize: string;
  bodyFontSize: string;
  forumName?: string;
}

export default function ForumPreviewCard({
  themeColor,
  primaryFont,
  secondaryFont,
  headingFontSize,
  bodyFontSize,
  forumName = "Your Forum"
}: ForumPreviewCardProps) {
  // Create dynamic styles based on theme settings
  const previewStyle = {
    "--primary-color": themeColor,
    "--primary-font": primaryFont,
    "--secondary-font": secondaryFont,
    "--heading-size": headingFontSize,
    "--body-size": bodyFontSize,
  } as React.CSSProperties;

  return (
    <div className="w-full" style={previewStyle}>
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="pb-2">
          <h3 className="text-lg font-medium">Live Preview</h3>
          <p className="text-xs text-muted-foreground">See how your forum will appear to users</p>
        </CardHeader>
        <CardContent className="p-0">
          <Glassmorphism className="rounded-xl overflow-hidden shadow-md">
            {/* Forum Header */}
            <div 
              className="flex items-center justify-between p-4 border-b" 
              style={{
                borderColor: `${themeColor}20`,
                fontFamily: primaryFont,
              }}
            >
              <div className="flex items-center space-x-3">
                <div style={{ backgroundColor: themeColor, color: "#ffffff" }} className="flex items-center justify-center w-8 h-8 rounded-full">
                  <span className="text-sm">F</span>
                </div>
                <h3 style={{ fontSize: headingFontSize, fontFamily: primaryFont }}>{forumName}</h3>
              </div>

              <div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="py-1 px-3 pr-8 rounded-lg text-xs w-24 md:w-32 bg-dark-300 border border-dark-400"
                    style={{ borderColor: `${themeColor}30` }}
                  />
                </div>
              </div>
            </div>

            {/* Category Pills */}
            <div 
              className="p-2 flex items-center space-x-2 overflow-x-auto"
              style={{ backgroundColor: `${themeColor}08` }}
            >
              <button
                className="px-2 py-0.5 text-xs rounded-full" 
                style={{ 
                  backgroundColor: `${themeColor}20`, 
                  color: themeColor,
                  fontFamily: secondaryFont
                }}
              >
                General
              </button>
              <button
                className="px-2 py-0.5 text-xs rounded-full"
                style={{ 
                  backgroundColor: "#33333320", 
                  fontFamily: secondaryFont
                }}
              >
                Questions
              </button>
              <button
                className="px-2 py-0.5 text-xs rounded-full"
                style={{ 
                  backgroundColor: "#33333320", 
                  fontFamily: secondaryFont
                }}
              >
                How-to
              </button>
            </div>

            {/* Question Preview */}
            <div className="p-4">
              <div 
                className="p-3 rounded-lg border mb-3"
                style={{ 
                  borderColor: `${themeColor}20`,
                  backgroundColor: `${themeColor}05`
                }}
              >
                <h4 
                  className="font-medium mb-1 line-clamp-1"
                  style={{ 
                    fontSize: headingFontSize, 
                    fontFamily: primaryFont,
                    color: themeColor
                  }}
                >
                  Sample question title goes here?
                </h4>
                <p 
                  className="text-gray-400 line-clamp-2"
                  style={{ 
                    fontSize: bodyFontSize,
                    fontFamily: secondaryFont
                  }}
                >
                  This is a sample question that shows how content will appear with your selected font and color settings...
                </p>
              </div>

              {/* Answer Preview */}
              <div 
                className="p-3 rounded-lg border ml-4"
                style={{ 
                  borderColor: `${themeColor}10`,
                  backgroundColor: `${themeColor}02`
                }}
              >
                <div className="flex items-center mb-1">
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center text-xs mr-2"
                    style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
                  >
                    A
                  </div>
                  <p 
                    className="text-sm font-medium"
                    style={{ fontFamily: primaryFont }}
                  >
                    Sample answer
                  </p>
                </div>
                <p 
                  className="text-gray-400 line-clamp-1"
                  style={{ 
                    fontSize: bodyFontSize,
                    fontFamily: secondaryFont
                  }}
                >
                  Here's what a response would look like with your selected styling...
                </p>
              </div>
            </div>
          </Glassmorphism>
        </CardContent>
      </Card>
    </div>
  );
}