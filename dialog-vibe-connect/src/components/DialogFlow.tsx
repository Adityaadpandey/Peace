
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, Calendar, Activity, Link2, Image } from "lucide-react";

interface SessionResult {
  id: string;
  type: string;
  title: string;
  instructor: string;
  description: string;
  hasImages: boolean;
  bookingLink: string;
}

const DialogFlow = () => {
  const [step, setStep] = useState(1);
  const [open, setOpen] = useState(true);
  const [formData, setFormData] = useState({
    mode: "",
    age: "",
    gender: "",
    sessionType: "",
  });

  const [results, setResults] = useState<SessionResult[]>([
    {
      id: "1",
      type: "Yoga",
      title: "Morning Flow Yoga",
      instructor: "Sarah Parker",
      description: "Gentle morning yoga session perfect for beginners",
      hasImages: true,
      bookingLink: "#",
    },
    {
      id: "2",
      type: "Meditation",
      title: "Mindfulness Meditation",
      instructor: "John Davis",
      description: "30-minute guided meditation focusing on breath awareness",
      hasImages: false,
      bookingLink: "#",
    },
  ]);

  const handleSelect = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (step < 5) {
      setStep(step + 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <DialogContent className="dialog-content animate-fade-in">
            <DialogHeader>
              <DialogTitle>Select Preferred Mode</DialogTitle>
              <DialogDescription>Choose how you'd like to attend your sessions</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <button className="option-card" onClick={() => handleSelect("mode", "online")}>
                Online Session
              </button>
              <button className="option-card" onClick={() => handleSelect("mode", "offline")}>
                In-Person Session
              </button>
            </div>
          </DialogContent>
        );

      case 2:
        return (
          <DialogContent className="dialog-content animate-fade-in">
            <DialogHeader>
              <DialogTitle>What's your age?</DialogTitle>
              <DialogDescription>This helps us find the most suitable sessions</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              {["18-25", "26-35", "36-45", "46+"].map((age) => (
                <button key={age} className="option-card" onClick={() => handleSelect("age", age)}>
                  {age}
                </button>
              ))}
            </div>
          </DialogContent>
        );

      case 3:
        return (
          <DialogContent className="dialog-content animate-fade-in">
            <DialogHeader>
              <DialogTitle>Select your gender</DialogTitle>
              <DialogDescription>For personalized session recommendations</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              {["Male", "Female", "Non-binary", "Prefer not to say"].map((gender) => (
                <button key={gender} className="option-card" onClick={() => handleSelect("gender", gender)}>
                  {gender}
                </button>
              ))}
            </div>
          </DialogContent>
        );

      case 4:
        return (
          <DialogContent className="dialog-content animate-fade-in">
            <DialogHeader>
              <DialogTitle>What type of session are you looking for?</DialogTitle>
              <DialogDescription>Choose the type of session you're interested in</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              {["Yoga", "Meditation", "Therapy", "Other"].map((type) => (
                <button key={type} className="option-card" onClick={() => handleSelect("sessionType", type)}>
                  {type}
                </button>
              ))}
            </div>
          </DialogContent>
        );

      case 5:
        return (
          <DialogContent className="dialog-content animate-fade-in">
            <DialogHeader>
              <DialogTitle>Available Sessions</DialogTitle>
              <DialogDescription>Here are some sessions that match your preferences</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 pt-4">
              {results.map((session) => (
                <div key={session.id} className="session-card">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center rounded-full bg-twitter-accent/10 px-3 py-1 text-sm text-twitter-accent">
                      {session.type}
                    </span>
                    {session.hasImages && (
                      <Image className="h-5 w-5 text-twitter-textSecondary" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-twitter-text">{session.title}</h3>
                    <p className="text-sm text-twitter-textSecondary">Instructor: {session.instructor}</p>
                    <p className="mt-2 text-twitter-textSecondary">{session.description}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      className="border-twitter-border bg-transparent text-twitter-accent hover:bg-twitter-accent/10"
                      onClick={() => window.open(session.bookingLink, "_blank")}
                    >
                      <Link2 className="mr-2 h-4 w-4" />
                      Book Session
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {renderStep()}
    </Dialog>
  );
};

export default DialogFlow;
