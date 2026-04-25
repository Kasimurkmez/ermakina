import React, { useState, useEffect } from 'react';
import { XIcon, RefreshCwIcon, TrashIcon } from './Icons';
import { FixtureData } from '../hooks/useFixtureData';
import { QRCodeSVG } from 'qrcode.react';

interface LabelPrintingModalProps {
  isOpen: boolean;
  onClose: () => void;
  allData: FixtureData[];
  initialSerialNo?: string | null;
}

interface LabelSlot {
  id: string;
  data: FixtureData | null;
}

interface BoxSlot {
  raf: string;
  palet: string;
  kutu: string;
}

type LabelMode = 'fixture' | 'box' | 'info-qr';

const createEmptySlots = (): LabelSlot[] =>
  Array.from({ length: 6 }, () => ({ id: '', data: null }));

const createEmptyBoxSlots = (): BoxSlot[] =>
  Array.from({ length: 6 }, () => ({
    raf: '',
    palet: '',
    kutu: '',
  }));

const cleanText = (value: string): string =>
  String(value || '')
    .toLocaleUpperCase('tr-TR')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeKutu = (value: string): string => {
  const clean = cleanText(value).replace(/\s+/g, '');

  if (!clean) return '';

  const match = clean.match(/^KUTU-?0?(\d+)$/);

  if (match) {
    return `KUTU-${match[1]}`;
  }

  return clean;
};

const normalizePalet = (value: string): string => {
  const clean = cleanText(value).replace(/\s+/g, '');

  if (!clean) return '';

  const match = clean.match(/^P-?0*(\d+)$/);

  if (match) {
    return `P-${match[1].padStart(3, '0')}`;
  }

  return clean;
};

const buildBoxAddress = (box: BoxSlot): string => {
  const raf = cleanText(box.raf).replace(/\s+/g, '');
  const palet = normalizePalet(box.palet);
  const kutu = normalizeKutu(box.kutu);

  if (!raf || !palet || !kutu) return '';

  return `${raf}-${palet}-${kutu}`;
};

const LabelPrintingModal: React.FC<LabelPrintingModalProps> = ({
  isOpen,
  onClose,
  allData,
  initialSerialNo,
}) => {
  const [labelMode, setLabelMode] = useState<LabelMode>('fixture');
  const [slots, setSlots] = useState<LabelSlot[]>(createEmptySlots());
  const [boxSlots, setBoxSlots] = useState<BoxSlot[]>(createEmptyBoxSlots());

  useEffect(() => {
    if (isOpen) {
      setLabelMode('fixture');

      if (initialSerialNo) {
        const found = allData.find(
          (d) =>
            String(d['seri no']).trim().toLowerCase() ===
            initialSerialNo.trim().toLowerCase()
        );

        if (found) {
          setSlots((prev) => {
            const newSlots = [...prev];
            newSlots[0] = { id: initialSerialNo, data: found };
            return newSlots;
          });
        }
      }
    } else {
      setSlots(createEmptySlots());
      setBoxSlots(createEmptyBoxSlots());
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, initialSerialNo, allData, onClose]);

  const handleInputChange = (index: number, value: string) => {
    setSlots((prev) => {
      const newSlots = [...prev];
      newSlots[index] = { ...newSlots[index], id: value };
      return newSlots;
    });
  };

  const handleSearch = (index: number) => {
    const slot = slots[index];

    if (!slot.id) return;

    const found = allData.find(
      (d) =>
        String(d['seri no']).trim().toLowerCase() ===
        slot.id.trim().toLowerCase()
    );

    setSlots((prev) => {
      const newSlots = [...prev];

      newSlots[index] = {
        id: found ? String(found['seri no']) : slot.id,
        data: found || null,
      };

      return newSlots;
    });
  };

  const handleClearSlot = (index: number) => {
    setSlots((prev) => {
      const newSlots = [...prev];
      newSlots[index] = { id: '', data: null };
      return newSlots;
    });
  };

  const handleBoxInputChange = (
    index: number,
    field: keyof BoxSlot,
    value: string
  ) => {
    setBoxSlots((prev) => {
      const newSlots = [...prev];
      newSlots[index] = {
        ...newSlots[index],
        [field]: value,
      };
      return newSlots;
    });
  };

  const handleClearBoxSlot = (index: number) => {
    setBoxSlots((prev) => {
      const newSlots = [...prev];
      newSlots[index] = { raf: '', palet: '', kutu: '' };
      return newSlots;
    });
  };

  const handleClearAll = () => {
    if (!window.confirm('Tüm etiketleri temizlemek istediğinize emin misiniz?')) {
      return;
    }

    if (labelMode === 'fixture' || labelMode === 'info-qr') {
      setSlots(createEmptySlots());
    } else {
      setBoxSlots(createEmptyBoxSlots());
    }
  };

  const handlePrint = () => {
    const printableArea = document.getElementById('label-printable-area');

    if (!printableArea) return;

    const printWindow = window.open('', '_blank');

    if (!printWindow) return;

    const customStyles =
      labelMode === 'fixture'
        ? `
          .label-grid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: repeat(3, 1fr); gap: 0.5cm; height: 27.5cm; overflow: hidden; }
          .label-box { border: 2px solid black; padding: 0; display: flex; flex-direction: column; height: 100%; box-sizing: border-box; page-break-inside: avoid; overflow: hidden; }
          .label-header { text-align: center; font-size: 40px; font-weight: bold; padding: 4px; border-bottom: 2px solid black; }
          .info-row { display: flex; border-bottom: 1px solid black; font-size: 13px; flex-grow: 1; min-height: 0; }
          .info-row:last-child { border-bottom: none; }
          .info-label { width: 35%; font-weight: bold; border-right: 1px solid black; padding: 2px 6px; display: flex; align-items: center; text-transform: uppercase; }
          .info-value { width: 65%; padding: 2px 6px; display: flex; align-items: center; word-break: break-word; line-height: 1.1; }
          .qr-container { width: 100%; height: 50px; display: flex; justify-content: center; align-items: center; overflow: hidden; padding: 2px; }
          .qr-container svg { max-height: 100% !important; width: auto; }
        `
        : `
          .label-grid { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: repeat(3, 1fr); gap: 0.5cm; height: 27.5cm; overflow: hidden; }
          .box-label-container { border: 4px solid black; display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; box-sizing: border-box; padding: 10px; page-break-inside: avoid; text-align: center; overflow: hidden; }
          .box-title { font-size: 18px; font-weight: bold; letter-spacing: 1px; border-bottom: 2px solid black; padding-bottom: 5px; width: 90%; margin-bottom: 10px; text-transform: uppercase; }
          .box-name { font-size: 34px; font-weight: 900; margin-bottom: 15px; word-break: break-word; text-align: center; line-height: 1; text-transform: uppercase; }
          .box-qr-wrapper { height: 160px; width: 160px; display: flex; justify-content: center; align-items: center; }
          .box-qr-wrapper svg { max-width: 100%; max-height: 100%; }
        `;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Er Makina Etiket</title>
        <style>
          @page { size: A4 portrait; margin: 1cm; }
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; box-sizing: border-box; }
          ${customStyles}
        </style>
      </head>
      <body>
        ${printableArea.innerHTML}
      </body>
      </html>
    `);

    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-lg shadow-2xl p-6 w-full max-w-6xl h-[90vh] flex flex-col border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-end mb-6 flex-shrink-0 border-b border-gray-700 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-teal-400 flex items-center gap-3">
              Etiket Yazdırma Modülü
            </h2>

            <div className="mt-4 flex gap-2 bg-gray-800 p-1 rounded-lg w-fit overflow-x-auto">
              <button
                onClick={() => setLabelMode('fixture')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${
                  labelMode === 'fixture'
                    ? 'bg-teal-600 text-white shadow'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Fikstür Etiketi (Tablolu)
              </button>

              <button
                onClick={() => setLabelMode('info-qr')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${
                  labelMode === 'info-qr'
                    ? 'bg-fuchsia-600 text-white shadow'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Fikstür Künyesi (Dev QR)
              </button>

              <button
                onClick={() => setLabelMode('box')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all whitespace-nowrap ${
                  labelMode === 'box'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Kutu / Raf Etiketi
              </button>
            </div>
          </div>

          <div className="flex gap-3 h-fit">
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-red-900/50 hover:bg-red-800 text-red-200 rounded-md transition-colors flex items-center gap-2 text-sm"
            >
              <TrashIcon className="w-4 h-4" /> Temizle
            </button>

            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <XIcon className="w-8 h-8" />
            </button>
          </div>
        </div>

        <div className="flex-grow flex gap-6 overflow-hidden">
          <div className="w-1/3 bg-gray-800/50 rounded-lg border border-gray-700 p-4 overflow-y-auto custom-scrollbar">
            <h3 className="text-white font-semibold mb-4 border-b border-gray-700 pb-2">
              {labelMode === 'box'
                ? 'Raf / Palet / Kutu Bilgisi Girin'
                : 'Fikstür Seri No Girin'}
            </h3>

            <div className="space-y-4">
              {(labelMode === 'fixture' || labelMode === 'info-qr') &&
                slots.map((slot, index) => (
                  <div
                    key={index}
                    className="bg-gray-900 p-3 rounded border border-gray-700 hover:border-teal-500/50 transition-colors"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className={`text-xs font-bold ${
                          labelMode === 'info-qr'
                            ? 'text-fuchsia-400'
                            : 'text-teal-500'
                        }`}
                      >
                        Etiket {index + 1}
                      </span>

                      <button
                        onClick={() => handleClearSlot(index)}
                        className="text-gray-500 hover:text-red-400"
                      >
                        <XIcon className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={slot.id}
                        onChange={(e) =>
                          handleInputChange(index, e.target.value)
                        }
                        onBlur={() => handleSearch(index)}
                        onKeyDown={(e) =>
                          e.key === 'Enter' && handleSearch(index)
                        }
                        placeholder="Örn: F2094"
                        className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-sm focus:border-teal-500 outline-none uppercase font-mono"
                      />

                      <button
                        onClick={() => handleSearch(index)}
                        className="bg-gray-700 hover:bg-gray-600 px-2 rounded text-gray-300"
                      >
                        <RefreshCwIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {slot.data ? (
                      <div className="mt-2 text-[10px] text-green-400 truncate">
                        ✓ {slot.data['parça adı']}
                      </div>
                    ) : (
                      slot.id && (
                        <div className="mt-2 text-[10px] text-yellow-500">
                          Aranıyor...
                        </div>
                      )
                    )}
                  </div>
                ))}

              {labelMode === 'box' &&
                boxSlots.map((val, index) => {
                  const fullAddress = buildBoxAddress(val);

                  return (
                    <div
                      key={index}
                      className="bg-gray-900 p-3 rounded border border-gray-700 hover:border-indigo-500/50 transition-colors"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-indigo-400">
                          Adres Etiketi {index + 1}
                        </span>

                        <button
                          onClick={() => handleClearBoxSlot(index)}
                          className="text-gray-500 hover:text-red-400"
                        >
                          <XIcon className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          value={val.raf}
                          onChange={(e) =>
                            handleBoxInputChange(index, 'raf', e.target.value)
                          }
                          placeholder="RAF A1"
                          className="bg-gray-800 border border-gray-600 rounded px-2 py-2 text-white text-xs focus:border-indigo-500 outline-none uppercase font-mono"
                        />

                        <input
                          type="text"
                          value={val.palet}
                          onChange={(e) =>
                            handleBoxInputChange(
                              index,
                              'palet',
                              e.target.value
                            )
                          }
                          placeholder="P-001"
                          className="bg-gray-800 border border-gray-600 rounded px-2 py-2 text-white text-xs focus:border-indigo-500 outline-none uppercase font-mono"
                        />

                        <input
                          type="text"
                          value={val.kutu}
                          onChange={(e) =>
                            handleBoxInputChange(index, 'kutu', e.target.value)
                          }
                          placeholder="KUTU-1"
                          className="bg-gray-800 border border-gray-600 rounded px-2 py-2 text-white text-xs focus:border-indigo-500 outline-none uppercase font-mono"
                        />
                      </div>

                      <div
                        className={`mt-2 text-[10px] truncate ${
                          fullAddress ? 'text-green-400' : 'text-gray-500'
                        }`}
                      >
                        {fullAddress || 'Örn: A1-P-001-KUTU-1'}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="w-2/3 flex flex-col">
            <div className="bg-white text-black p-4 flex-grow overflow-y-auto rounded shadow-inner mb-4">
              <div id="label-printable-area" className="w-full h-full">
                <div className="label-grid">
                  {labelMode === 'fixture' &&
                    slots.map((slot, index) => {
                      const qrPayload = slot.data
                        ? `http://192.168.2.21:8080/?serial=${slot.data['seri no']}`
                        : '';

                      return (
                        <div key={index} className="label-box">
                          <div className="label-header">
                            {slot.data ? slot.data['seri no'] : slot.id || ''}
                          </div>

                          <div className="flex-grow flex flex-col">
                            {[
                              { label: 'MÜŞTERİ', val: slot.data?.['müşteri'] },
                              { label: 'PROJE', val: slot.data?.['proje'] },
                              {
                                label: 'PARÇA NO',
                                val: slot.data?.['parça no'],
                              },
                              {
                                label: 'PARÇA ADI',
                                val: slot.data?.['parça adı'],
                              },
                              {
                                label: 'OPERASYON ADI',
                                val: slot.data?.['operasyon adı'],
                              },
                              {
                                label: 'FİKSTÜR TANIMI',
                                val: slot.data?.['fikstür tanımı'],
                              },
                              {
                                label: 'QR',
                                val: slot.data ? (
                                  <div className="qr-container">
                                    <QRCodeSVG
                                      value={qrPayload}
                                      size={50}
                                      level="L"
                                    />
                                  </div>
                                ) : (
                                  ''
                                ),
                              },
                            ].map((row, i) => (
                              <div key={i} className="info-row">
                                <div className="info-label">{row.label}</div>
                                <div className="info-value">
                                  {row.val || ''}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                  {labelMode === 'info-qr' &&
                    slots.map((slot, index) => {
                      const giantQrContent = slot.data
                        ? `http://192.168.2.21:8080/?serial=${slot.data['seri no']}`
                        : '';

                      return (
                        <div key={index} className="box-label-container">
                          {slot.data ? (
                            <>
                              <div
                                className="box-title"
                                style={{
                                  fontSize: '16px',
                                  borderBottom: 'none',
                                  marginBottom: '5px',
                                }}
                              >
                                FİKSTÜR BİLGİ BARKODU
                              </div>

                              <div
                                className="box-name"
                                style={{
                                  fontSize: '22px',
                                  marginBottom: '10px',
                                }}
                              >
                                {slot.data['seri no']}
                              </div>

                              <div className="box-qr-wrapper">
                                <QRCodeSVG
                                  value={giantQrContent}
                                  size={160}
                                  level="L"
                                />
                              </div>
                            </>
                          ) : (
                            <div style={{ color: '#ccc', fontStyle: 'italic' }}>
                              Boş Künye Etiketi
                            </div>
                          )}
                        </div>
                      );
                    })}

                  {labelMode === 'box' &&
                    boxSlots.map((box, index) => {
                      const fullAddress = buildBoxAddress(box);
                      const boxQrContent = fullAddress
                        ? `http://192.168.2.21:8080/?serial=${fullAddress}`
                        : '';

                      return (
                        <div key={index} className="box-label-container">
                          {fullAddress ? (
                            <>
                              <div
                                className="box-title"
                                style={{ fontSize: '16px' }}
                              >
                                RAF / PALET / KUTU BARKODU
                              </div>

                              <div
                                className="box-name"
                                style={{
                                  fontSize: '30px',
                                  marginBottom: '10px',
                                }}
                              >
                                {fullAddress}
                              </div>

                              <div className="box-qr-wrapper">
                                <QRCodeSVG
                                  value={boxQrContent}
                                  size={150}
                                  level="L"
                                />
                              </div>
                            </>
                          ) : (
                            <div style={{ color: '#ccc', fontStyle: 'italic' }}>
                              Boş Adres Etiketi
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handlePrint}
                className={`px-6 py-3 text-white font-bold rounded-lg shadow-lg flex items-center gap-2 ${
                  labelMode === 'fixture'
                    ? 'bg-teal-600 hover:bg-teal-500'
                    : labelMode === 'info-qr'
                    ? 'bg-fuchsia-600 hover:bg-fuchsia-500'
                    : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                <RefreshCwIcon className="w-5 h-5 hidden" /> Yazdır
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelPrintingModal;