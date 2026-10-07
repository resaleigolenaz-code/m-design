import { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { 
  MousePointer2, Gem, PenTool, Eraser, Move, RotateCw, 
  FlipHorizontal, Copy, Trash2, Undo, Redo, 
  Mic, PenLine, Image as ImageIcon, Send, Sparkles,
  Eye, Lock, HelpCircle, Bell
} from 'lucide-react';

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  
  // State for dynamic logic
  const [activeColor, setActiveColor] = useState('diamond');
  const [activeShape, setActiveShape] = useState('round');
  const [isDrawing, setIsDrawing] = useState(false);
  const [goldColor] = useState('#C9A25E'); // Default Rose Gold

  useEffect(() => {
    if (canvasRef.current && !canvas) {
      const initCanvas = new fabric.Canvas(canvasRef.current, {
        width: canvasRef.current.parentElement?.clientWidth || 800,
        height: canvasRef.current.parentElement?.clientHeight || 600,
        backgroundColor: 'transparent',
        selection: true,
        preserveObjectStacking: true
      });
      
      setCanvas(initCanvas);

      // Load a real, high-quality jewelry piece as the starting point
      fabric.Image.fromURL('/assets/kite-necklace.webp').then((img) => {
        img.scaleToWidth(400);
        img.set({
          left: initCanvas.width! / 2 - 200,
          top: initCanvas.height! / 2 - 200,
          cornerColor: '#C9A25E',
          borderColor: '#C9A25E',
          cornerStyle: 'circle',
          transparentCorners: false,
          cornerSize: 10,
          padding: 10
        });
        initCanvas.add(img);
        initCanvas.setActiveObject(img);
        initCanvas.renderAll();
      }).catch(err => console.log('Image not found', err));

      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          initCanvas.setDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height
          });
        }
      });
      
      if (canvasRef.current.parentElement) {
        resizeObserver.observe(canvasRef.current.parentElement);
      }

      return () => {
        resizeObserver.disconnect();
        initCanvas.dispose();
      };
    }
  }, [canvasRef]);

  // Toolbar actions
  const handleDelete = () => {
    if (canvas) {
      const activeObjects = canvas.getActiveObjects();
      if (activeObjects.length) {
        canvas.discardActiveObject();
        activeObjects.forEach(obj => canvas.remove(obj));
      }
    }
  };

  const handleDuplicate = () => {
    if (canvas) {
      const activeObject = canvas.getActiveObject();
      if (activeObject) {
        activeObject.clone().then((cloned) => {
          cloned.set({
            left: activeObject.left! + 20,
            top: activeObject.top! + 20,
            evented: true,
          });
          if (cloned instanceof fabric.ActiveSelection) {
            cloned.canvas = canvas;
            cloned.forEachObject((obj: fabric.FabricObject) => canvas.add(obj));
            cloned.setCoords();
          } else {
            canvas.add(cloned);
          }
          canvas.setActiveObject(cloned);
          canvas.requestRenderAll();
        });
      }
    }
  };

  const addJewelryPiece = (path: string) => {
    if (!canvas) return;
    fabric.Image.fromURL(path).then((img) => {
      img.scaleToWidth(150);
      img.set({
        left: canvas.width! / 2 - 75,
        top: canvas.height! / 2 - 75,
        cornerColor: '#C9A25E',
        borderColor: '#C9A25E',
        cornerStyle: 'circle',
        transparentCorners: false,
        cornerSize: 10,
        padding: 10
      });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    });
  };

  const addStone = (shapeOverride?: string) => {
    if (!canvas) return;
    
    const shapeToUse = shapeOverride || activeShape;
    
    // Map combination to real asset. 
    // For prototype, we map the 3 we generated. Others alert.
    let path = '';
    if (activeColor === 'diamond' && shapeToUse === 'round') path = '/assets/diamond.jpg';
    else if (activeColor === 'ruby' && shapeToUse === 'pear') path = '/assets/ruby.jpg';
    else if (activeColor === 'emerald' && shapeToUse === 'emerald_cut') path = '/assets/emerald.jpg';
    else {
      alert(`The real asset for ${activeColor} in ${shapeToUse} cut has not been generated yet. Please select Ruby+Pear, Diamond+Round, or Emerald+EmeraldCut.`);
      return;
    }

    fabric.Image.fromURL(path).then((img) => {
      img.scaleToWidth(80);
      img.set({
        left: canvas.width! / 2 - 40,
        top: canvas.height! / 2 - 40,
        cornerColor: '#C9A25E',
        borderColor: '#C9A25E',
        cornerStyle: 'circle',
        transparentCorners: false,
        cornerSize: 10,
        padding: 10,
        globalCompositeOperation: 'multiply'
      });
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
    });
  };

  const toggleDrawingMode = () => {
    if (!canvas) return;
    const newDrawingState = !isDrawing;
    canvas.isDrawingMode = newDrawingState;
    if (newDrawingState) {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = goldColor;
      canvas.freeDrawingBrush.width = 4;
    }
    setIsDrawing(newDrawingState);
  };

  useEffect(() => {
    if (canvas && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = goldColor;
    }
  }, [goldColor, canvas]);

  return (
    <div className="app-container">
      
      {/* TOP TOOLBAR */}
      <header className="top-toolbar">
        <button className={`tool-btn ${!isDrawing ? 'active' : ''}`} onClick={() => { if(canvas) canvas.isDrawingMode = false; setIsDrawing(false); }}>
          <MousePointer2 size={20} strokeWidth={1.5} />
          Select
        </button>
        <button className="tool-btn" onClick={() => addStone()}>
          <Gem size={20} strokeWidth={1.5} />
          Add Stones
        </button>
        <button className={`tool-btn ${isDrawing ? 'active' : ''}`} onClick={toggleDrawingMode} style={{ border: isDrawing ? '2px solid #C9A25E' : 'none' }}>
          <PenTool size={20} strokeWidth={1.5} />
          Draw Gold
        </button>
        <button className="tool-btn" onClick={handleDelete}>
          <Eraser size={20} strokeWidth={1.5} />
          Eraser
        </button>
        <div className="toolbar-divider" />
        <button className="tool-btn">
          <Move size={20} strokeWidth={1.5} />
          Move
        </button>
        <button className="tool-btn">
          <RotateCw size={20} strokeWidth={1.5} />
          Rotate
        </button>
        <button className="tool-btn">
          <FlipHorizontal size={20} strokeWidth={1.5} />
          Mirror
        </button>
        <button className="tool-btn" onClick={handleDuplicate}>
          <Copy size={20} strokeWidth={1.5} />
          Duplicate
        </button>
        <button className="tool-btn" onClick={handleDelete}>
          <Trash2 size={20} strokeWidth={1.5} />
          Delete
        </button>
        <div className="toolbar-divider" />
        <button className="tool-btn">
          <Undo size={20} strokeWidth={1.5} />
          Undo
        </button>
        <button className="tool-btn">
          <Redo size={20} strokeWidth={1.5} />
          Redo
        </button>
        
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', color: 'var(--text-secondary)' }}>
          <HelpCircle size={20} />
          <Bell size={20} />
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#C9A25E', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>A</div>
        </div>
      </header>
      
      <main className="main-content">
        
        {/* LEFT SIDEBAR (Diamonds & Stones) */}
        <aside className="sidebar-left">
          <div className="sidebar-header">Official Assets</div>
          
          <div className="section-title">Add Components</div>
          <div className="grid-container" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="grid-item" onClick={() => addJewelryPiece('/assets/kite-earring.webp')}>
              <div className="swatch" style={{ background: 'white', border: '1px solid #eee', borderRadius: '8px' }}>
                <img src="/assets/kite-earring.webp" style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Earring" />
              </div>
              <span>Kite Earring</span>
            </div>
            <div className="grid-item" onClick={() => addJewelryPiece('/assets/kite-ring.webp')}>
              <div className="swatch" style={{ background: 'white', border: '1px solid #eee', borderRadius: '8px' }}>
                <img src="/assets/kite-ring.webp" style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Ring" />
              </div>
              <span>Kite Ring</span>
            </div>
            <div className="grid-item" onClick={() => addJewelryPiece('/assets/kite-chain.webp')}>
              <div className="swatch" style={{ background: 'white', border: '1px solid #eee', borderRadius: '8px' }}>
                <img src="/assets/kite-chain.webp" style={{ width: '100%', height: '100%', objectFit: 'contain' }} alt="Chain" />
              </div>
              <span>Kite Chain</span>
            </div>
          </div>

          <div className="sidebar-header" style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)' }}>Diamonds & Stones</div>
          <div className="section-title">1. Stone / Color</div>
          <div className="grid-container" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div className={`grid-item ${activeColor === 'diamond' ? 'active' : ''}`} onClick={() => setActiveColor('diamond')}>
              <div className="swatch" style={{ border: '1px solid #ddd', overflow: 'hidden' }}>
                <img src="/assets/diamond.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'multiply' }} alt="Diamond" />
              </div>
              <span style={{ fontSize: '10px', textAlign: 'center' }}>Diamond</span>
            </div>
            <div className="grid-item">
              <div className="swatch"><div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#333' }} /></div>
              <span style={{ fontSize: '10px', textAlign: 'center' }}>Black Diamond</span>
            </div>
            <div className={`grid-item ${activeColor === 'ruby' ? 'active' : ''}`} onClick={() => setActiveColor('ruby')}>
              <div className="swatch" style={{ border: '1px solid #ddd', overflow: 'hidden' }}>
                <img src="/assets/ruby.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'multiply' }} alt="Ruby" />
              </div>
              <span style={{ fontSize: '10px', textAlign: 'center' }}>Ruby</span>
            </div>
            <div className="grid-item">
              <div className="swatch"><div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#1C4AD9' }} /></div>
              <span style={{ fontSize: '10px', textAlign: 'center' }}>Blue Sapphire</span>
            </div>
            
            <div className="grid-item">
              <div className="swatch"><div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ff66b2' }} /></div>
              <span style={{ fontSize: '10px', textAlign: 'center' }}>Pink Sapphire</span>
            </div>
            <div className={`grid-item ${activeColor === 'emerald' ? 'active' : ''}`} onClick={() => setActiveColor('emerald')}>
              <div className="swatch" style={{ border: '1px solid #ddd', overflow: 'hidden' }}>
                <img src="/assets/emerald.jpg" style={{ width: '100%', height: '100%', objectFit: 'cover', mixBlendMode: 'multiply' }} alt="Emerald" />
              </div>
              <span style={{ fontSize: '10px', textAlign: 'center' }}>Emerald</span>
            </div>
            <div className="grid-item">
              <div className="swatch"><div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#9a1a1a' }} /></div>
              <span style={{ fontSize: '10px', textAlign: 'center' }}>Garnet</span>
            </div>
            <div className="grid-item">
              <div className="swatch"><div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#111' }} /></div>
              <span style={{ fontSize: '10px', textAlign: 'center' }}>Onyx</span>
            </div>

            <div className="grid-item">
              <div className="swatch"><div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#169a58' }} /></div>
              <span style={{ fontSize: '10px', textAlign: 'center' }}>Malachite</span>
            </div>
            <div className="grid-item">
              <div className="swatch"><div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#2244aa' }} /></div>
              <span style={{ fontSize: '10px', textAlign: 'center' }}>Lapis Lazuli</span>
            </div>
            <div className="grid-item">
              <div className="swatch"><div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#eee' }} /></div>
              <span style={{ fontSize: '10px', textAlign: 'center' }}>Mother of Pearl</span>
            </div>
            <div className="grid-item">
              <div className="swatch"><div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ff7f50' }} /></div>
              <span style={{ fontSize: '10px', textAlign: 'center' }}>Coral</span>
            </div>

            <div className="grid-item">
              <div className="swatch"><div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#40e0d0' }} /></div>
              <span style={{ fontSize: '10px', textAlign: 'center' }}>Turquoise</span>
            </div>
          </div>

          <div className="section-title" style={{ marginTop: '32px' }}>2. Shape / Cut</div>
          <div className="grid-container" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
             <div className={`grid-item ${activeShape === 'round' ? 'active' : ''}`} onClick={() => { setActiveShape('round'); addStone('round'); }}>
               <div className="swatch" style={{ borderRadius: '0', padding: '4px' }}><div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#C9A25E' }} /></div>
               <span style={{ fontSize: '10px', textAlign: 'center' }}>Round</span>
             </div>
             <div className="grid-item">
               <div className="swatch" style={{ borderRadius: '0', padding: '4px' }}><div style={{ width: '18px', height: '26px', borderRadius: '50%', background: '#C9A25E' }} /></div>
               <span style={{ fontSize: '10px', textAlign: 'center' }}>Oval</span>
             </div>
             <div className={`grid-item ${activeShape === 'emerald_cut' ? 'active' : ''}`} onClick={() => { setActiveShape('emerald_cut'); addStone('emerald_cut'); }}>
               <div className="swatch" style={{ borderRadius: '0', padding: '4px' }}><div style={{ width: '18px', height: '26px', clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)', background: '#C9A25E' }} /></div>
               <span style={{ fontSize: '10px', textAlign: 'center' }}>Emerald Cut</span>
             </div>
             <div className={`grid-item ${activeShape === 'pear' ? 'active' : ''}`} onClick={() => { setActiveShape('pear'); addStone('pear'); }}>
               <div className="swatch" style={{ borderRadius: '0', padding: '4px' }}><div style={{ width: '20px', height: '26px', clipPath: 'polygon(50% 0%, 100% 50%, 100% 100%, 0% 100%, 0% 50%)', background: '#C9A25E' }} /></div>
               <span style={{ fontSize: '10px', textAlign: 'center' }}>Pear</span>
             </div>
             
             <div className="grid-item">
               <div className="swatch" style={{ borderRadius: '0', padding: '4px' }}><div style={{ width: '16px', height: '28px', clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)', background: '#D91C4A' }} /></div>
               <span style={{ fontSize: '10px', textAlign: 'center' }}>Marquise</span>
             </div>
             <div className="grid-item">
               <div className="swatch" style={{ borderRadius: '0', padding: '4px' }}><div style={{ width: '12px', height: '28px', background: '#D91C4A' }} /></div>
               <span style={{ fontSize: '10px', textAlign: 'center' }}>Baguette</span>
             </div>
             <div className="grid-item">
               <div className="swatch" style={{ borderRadius: '0', padding: '4px' }}><div style={{ width: '24px', height: '24px', background: '#D91C4A' }} /></div>
               <span style={{ fontSize: '10px', textAlign: 'center' }}>Princess</span>
             </div>
             <div className="grid-item">
               <div className="swatch" style={{ borderRadius: '0', padding: '4px' }}><div style={{ width: '26px', height: '26px', borderRadius: '4px', background: '#D91C4A' }} /></div>
               <span style={{ fontSize: '10px', textAlign: 'center' }}>Cushion</span>
             </div>
          </div>
          <div style={{ fontSize: '11px', color: 'gray', padding: '8px 20px' }}>8 cuts available for Ruby</div>

          <div className="section-title" style={{ marginTop: '24px' }}>3. Size</div>
          <div style={{ padding: '0 20px', paddingBottom: '20px' }}>
            <div style={{ display: 'flex', background: '#f5f5f5', borderRadius: '4px', padding: '4px' }}>
              <div style={{ flex: 1, textAlign: 'center', fontSize: '12px', padding: '6px' }}>Small</div>
              <div style={{ flex: 1, textAlign: 'center', fontSize: '12px', padding: '6px', background: 'white', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>Medium</div>
              <div style={{ flex: 1, textAlign: 'center', fontSize: '12px', padding: '6px' }}>Large</div>
            </div>
          </div>
        </aside>
        
        {/* CANVAS */}
        <section className="canvas-area">
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <canvas ref={canvasRef} />
          </div>
          
          <div className="bottom-bar">
            <div className="ai-input-wrapper">
              <Mic size={18} color="gray" style={{ cursor: 'pointer' }} />
              <PenLine size={18} color="gray" style={{ cursor: 'pointer', marginLeft: '12px' }} />
              <ImageIcon size={18} color="gray" style={{ cursor: 'pointer', marginLeft: '12px' }} />
              
              <input type="text" placeholder="Describe, draw, or ask AI to change the design..." />
              
              <Send size={18} color="var(--accent-gold)" style={{ cursor: 'pointer' }} />
            </div>
            <button className="btn-primary" onClick={() => alert('Design request functionality will be connected to Shopify backend.')}>
              <Sparkles size={18} />
              Request This Design
            </button>
          </div>
        </section>

        {/* RIGHT SIDEBAR (Selected Component Properties) */}
        <aside className="sidebar-right">
          <div className="property-group">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', background: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <Gem size={20} color="var(--accent-gold)" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>Selected Object</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Alaghband Component</div>
              </div>
            </div>
          </div>

          <div className="property-group">
            <div className="property-header">
              <span className="property-title">Component Size</span>
              <span className="property-value">Auto</span>
            </div>
            <div className="slider"><div className="slider-thumb" style={{ left: '50%' }} /></div>
          </div>

          <div className="property-group">
            <div className="property-header">
              <span className="property-title">Rotate</span>
              <span className="property-value">Interactive</span>
            </div>
            <div className="slider"><div className="slider-thumb" style={{ left: '0%' }} /></div>
          </div>

          <div className="property-group" style={{ flex: 1 }}>
            <div className="property-header" style={{ marginBottom: '16px' }}>
              <span className="property-title">Layers</span>
              <Trash2 size={16} color="var(--text-secondary)" style={{ cursor: 'pointer' }} onClick={handleDelete} />
            </div>
            <div className="layer-item active">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', background: '#ccc', borderRadius: '2px' }} />
                Main Design
              </div>
              <div style={{ display: 'flex', gap: '8px', color: 'gray' }}><Eye size={14} /><Lock size={14} /></div>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
