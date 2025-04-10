import React from "react";
import { Switch } from "./switch";
import { Button } from "./button";
import { Label } from "./label";
import { Slider } from "./slider";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { VolumeX, Volume2 } from "lucide-react";
import { useSoundSettings, playSoundEffect } from "@/lib/sounds";

export function SoundSettingsToggle() {
  const { enabled, toggleSounds } = useSoundSettings();

  const handleToggle = () => {
    toggleSounds();
    if (!enabled) {
      // We're toggling from disabled to enabled, so play a sound
      playSoundEffect("notification");
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="sound-toggle"
        checked={enabled}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="sound-toggle" className="cursor-pointer">
        {enabled ? "Sounds On" : "Sounds Off"}
      </Label>
    </div>
  );
}

export function SoundSettingsButton() {
  const { enabled, volume, setVolume, toggleSounds } = useSoundSettings();

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    playSoundEffect("buttonClick");
  };

  const handleToggle = () => {
    toggleSounds();
    if (!enabled) {
      // If we're turning sound on, play a test sound
      setTimeout(() => playSoundEffect("notification"), 100);
    }
  };

  const Icon = enabled ? Volume2 : VolumeX;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => playSoundEffect("buttonClick")}
        >
          <Icon className="h-5 w-5" />
          <span className="sr-only">Sound settings</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4" align="end">
        <div className="space-y-4">
          <h4 className="font-medium">Sound Settings</h4>
          
          <div className="flex items-center space-x-2">
            <Switch 
              id="sound-toggle-popup" 
              checked={enabled} 
              onCheckedChange={handleToggle} 
            />
            <Label htmlFor="sound-toggle-popup" className="cursor-pointer">
              {enabled ? "Sounds enabled" : "Sounds disabled"}
            </Label>
          </div>
          
          {enabled && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="volume" className="text-sm">
                  Volume
                </Label>
                <span className="text-xs text-muted-foreground">
                  {Math.round(volume * 100)}%
                </span>
              </div>
              <Slider
                id="volume"
                min={0}
                max={1}
                step={0.05}
                value={[volume]}
                onValueChange={handleVolumeChange}
              />
              <div className="mt-2 flex justify-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => playSoundEffect("notification")}
                >
                  Test Sound
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}