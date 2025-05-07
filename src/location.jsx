import React, { useState, useRef, useEffect } from "react";
import { fromLonLat } from "ol/proj";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import Feature from "ol/Feature";
import Point from "ol/geom/Point";
import Style from "ol/style/Style";
import CircleStyle from "ol/style/Circle";
import Fill from "ol/style/Fill";
import Stroke from "ol/style/Stroke";
import { ChevronLeft, ChevronRight } from "lucide-react";

const locations = [
  {
    name: "France",
    description: "World-class universities, strong in business, arts, and sciences.",
    color: "#3B82F6",
    lat: 48.8566,
    lon: 2.3522,
  },
  {
    name: "New Zealand",
    description: "Welcoming environment, world-class education, and a strong emphasis on research and innovation.",
    color: "#10B981",
    lat: -41.2865,
    lon: 174.7762,
  },
  {
    name: "Spain",
    description: "Vibrant culture, top universities in arts, architecture, and business.",
    color: "#F59E0B",
    lat: 40.4168,
    lon: -3.7038,
  },
  {
    name: "Cyprus",
    description: "Affordable tuition, English-speaking programs, strong degrees in business, engineering, and medicine.",
    color: "#8B5CF6",
    lat: 35.1856,
    lon: 33.3823,
  },
  {
    name: "UAE",
    description: "Global business hub with strong programs in tech, hospitality, and law.",
    color: "#EC4899",
    lat: 24.4539,
    lon: 54.3773,
  },
  {
    name: "Germany",
    description: "Strong in engineering, science, and business.",
    color: "#EF4444",
    lat: 52.52,
    lon: 13.405,
  },
  {
    name: "Australia",
    description: "Strong in engineering, science, and business.",
    color: "#6366F1",
    lat: -35.2809,
    lon: 149.13,
  },
  {
    name: "Canada",
    description: "Strong in engineering, science, and business.",
    color: "#14B8A6",
    lat: 45.4215,
    lon: -75.6972,
  },
  {
    name: "Ireland",
    description: "Strong in engineering, science, and business.",
    color: "#F97316",
    lat: 53.3498,
    lon: -6.2603,
  },
  {
    name: "Poland",
    description: "Strong in engineering, science, and business.",
    color: "#6D28D9",
    lat: 52.2297,
    lon: 21.0122,
  },
  {
    name: "UK",
    description: "Strong in engineering, science, and business.",
    color: "#0EA5E9",
    lat: 51.5074,
    lon: -0.1278,
  },
  {
    name: "USA",
    description: "Strong in engineering, science, and business.",
    color: "#DC2626",
    lat: 38.9072,
    lon: -77.0369,
  },
];

// Define marker styles
const createMarkerStyle = (color, isActive) => {
  return new Style({
    image: new CircleStyle({
      radius: isActive ? 10 : 6,
      fill: new Fill({ color: isActive ? color : "#64748B" }),
      stroke: new Stroke({ color: "white", width: isActive ? 3 : 2 }),
    }),
  });
};

export default function StudyDestinations() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);

  const sliderRef = useRef(null);
  const mapRef = useRef(null);
  const vectorSourceRef = useRef(null);
  const autoplayTimerRef = useRef(null);

  // Initialize container width and map
  useEffect(() => {
    if (sliderRef.current) {
      setContainerWidth(sliderRef.current.clientWidth);
    }

    // Create vector source with features for each location
    const vectorSource = new VectorSource({
      features: locations.map((location, index) => {
        const feature = new Feature({
          geometry: new Point(fromLonLat([location.lon, location.lat])),
          name: location.name,
          id: index,
          color: location.color,
        });
        feature.setStyle(
          createMarkerStyle(location.color, index === activeSlide)
        );
        return feature;
      }),
    });
    vectorSourceRef.current = vectorSource;

    // Initialize map with light gray style similar to the image
    const map = new Map({
      target: "map",
      layers: [
        new TileLayer({
          opacity: 0.8,
          source: new XYZ({
            url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
          }),
        }),
        new VectorLayer({
          source: vectorSource,
        }),
      ],
      view: new View({
        center: fromLonLat([
          locations[activeSlide].lon,
          locations[activeSlide].lat,
        ]),
        zoom: 2,
        minZoom: 2,
        maxZoom: 6,
      }),
      controls: [],
    });
    mapRef.current = map;

    // Clean up on component unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(null);
      }
      clearInterval(autoplayTimerRef.current);
    };
  }, []);

  // Set up autoplay timer
  useEffect(() => {
    if (autoplayEnabled) {
      autoplayTimerRef.current = setInterval(() => {
        handleNext();
      }, 5000);
    } else {
      clearInterval(autoplayTimerRef.current);
    }

    return () => clearInterval(autoplayTimerRef.current);
  }, [activeSlide, autoplayEnabled]);

  // Update map when active slide changes
  useEffect(() => {
    if (mapRef.current && vectorSourceRef.current) {
      // Update marker styles
      const features = vectorSourceRef.current.getFeatures();
      features.forEach((feature) => {
        const id = feature.get("id");
        const color = feature.get("color");
        feature.setStyle(createMarkerStyle(color, id === activeSlide));
      });

      // Animate map to new location
      const location = locations[activeSlide];
      mapRef.current.getView().animate({
        center: fromLonLat([location.lon, location.lat]),
        duration: 1000,
      });
    }
  }, [activeSlide]);

  // Update container width on window resize
  useEffect(() => {
    const handleResize = () => {
      if (sliderRef.current) {
        setContainerWidth(sliderRef.current.clientWidth);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle slide navigation
  const handlePrev = () => {
    setAutoplayEnabled(false);
    setActiveSlide((prev) => (prev === 0 ? locations.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveSlide((prev) => (prev === locations.length - 1 ? 0 : prev + 1));
  };

  const handleCardClick = (index) => {
    setActiveSlide(index);
    setAutoplayEnabled(false);
  };

  // Calculate card positions for the horizontal slider
  const getVisibleCards = () => {
    const cards = [];
    const totalCards = locations.length;
    
    // Calculate indices for cards to display (-2, -1, 0, 1, 2) relative to active slide
    for (let offset = -2; offset <= 2; offset++) {
      let index = activeSlide + offset;
      
      // Handle wrapping around the ends
      if (index < 0) index = totalCards + index;
      if (index >= totalCards) index = index - totalCards;
      
      cards.push({
        location: locations[index],
        index,
        offset,
      });
    }
    
    return cards;
  };

  // Get style for each card based on position relative to active card
  const getCardStyle = (offset) => {
    let translateX = '0%';
    let scale = 1;
    let zIndex = 10;
    let opacity = 1;
    
    switch (offset) {
      case -2:
        translateX = '-160%';
        scale = 0.8;
        zIndex = 1;
        opacity = 0.7;
        break;
      case -1:
        translateX = '-80%';
        scale = 0.9;
        zIndex = 2;
        opacity = 0.9;
        break;
      case 0:
        translateX = '0%';
        scale = 1;
        zIndex = 10;
        opacity = 1;
        break;
      case 1:
        translateX = '80%';
        scale = 0.9;
        zIndex = 2;
        opacity = 0.9;
        break;
      case 2:
        translateX = '160%';
        scale = 0.8;
        zIndex = 1;
        opacity = 0.7;
        break;
    }

    return {
      transform: `translateX(${translateX}) scale(${scale})`,
      opacity,
      zIndex,
    };
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-4xl font-bold text-indigo-900">
          Top Study Destinations
        </h1>
        <p className="text-gray-600 mt-2">
          Transformative experiences at world-leading institutions
        </p>
      </div>

      {/* Map - Takes majority of the screen */}
      <div id="map" className="w-full flex-grow" />

      {/* Slider - Full width at bottom of screen */}
      <div className="relative w-full h-64 mt-auto bg-white" ref={sliderRef}>
        {/* Slider controls */}
        <div className="absolute top-1/2 left-6 z-20 transform -translate-y-1/2">
          <button
            className="p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 transition-colors"
            onClick={handlePrev}
            aria-label="Previous destination"
          >
            <ChevronLeft size={24} className="text-indigo-900" />
          </button>
        </div>

        <div className="absolute top-1/2 right-6 z-20 transform -translate-y-1/2">
          <button
            className="p-2 rounded-full bg-white shadow-lg hover:bg-gray-100 transition-colors"
            onClick={handleNext}
            aria-label="Next destination"
          >
            <ChevronRight size={24} className="text-indigo-900" />
          </button>
        </div>

        {/* Cards container - full width, horizontally centered */}
        <div className="absolute bottom-0 left-0 w-full h-full">
          <div className="relative h-full w-full max-w-6xl mx-auto">
            {getVisibleCards().map(({ location, index, offset }) => (
              <div
                key={index}
                className="absolute top-8 left-1/2 transform -translate-x-1/2 w-64 h-48 transition-all duration-500 cursor-pointer"
                style={getCardStyle(offset)}
                onClick={() => handleCardClick(index)}
              >
                <div 
                  className={`bg-white rounded-lg shadow-xl overflow-hidden h-full border-t-4`}
                  style={{ borderColor: location.color }}
                >
                  <div
                    className="h-24 w-full bg-cover bg-center"
                    style={{
                      backgroundImage: `url("/api/placeholder/300/200")`,
                    }}
                  />
                  <div className="p-3">
                    <h3
                      className="text-lg font-bold mb-1"
                      style={{ color: location.color }}
                    >
                      {location.name}
                    </h3>
                    <p className="text-gray-700 text-xs line-clamp-2">
                      {location.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}