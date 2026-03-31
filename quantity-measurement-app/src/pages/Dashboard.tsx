import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { compareApi, convertApi, addApi, subtractApi, multiplyApi, divideApi } from '../api';
import '../styles/dashboard.css';

var UNITS: any = {
  length: [
    { label: 'Feet',        backendUnit: 'FEET'        },
    { label: 'Inches',      backendUnit: 'INCHES'      },
    { label: 'Yards',       backendUnit: 'YARDS'       },
    { label: 'Centimeters', backendUnit: 'CENTIMETERS' },
  ],
  weight: [
    { label: 'Kilogram',  backendUnit: 'KILOGRAM'  },
    { label: 'Gram',      backendUnit: 'GRAM'      },
    { label: 'Milligram', backendUnit: 'MILLIGRAM' },
    { label: 'Pound',     backendUnit: 'POUND'     },
    { label: 'Tonne',     backendUnit: 'TONNE'     },
  ],
  temperature: [
    { label: 'Celsius',    backendUnit: 'CELSIUS'    },
    { label: 'Fahrenheit', backendUnit: 'FAHRENHEIT' },
    { label: 'Kelvin',     backendUnit: 'KELVIN'     },
  ],
  volume: [
    { label: 'Litre',      backendUnit: 'LITRE'      },
    { label: 'Millilitre', backendUnit: 'MILLILITRE' },
    { label: 'Gallon',     backendUnit: 'GALLON'     },
  ],
};

var MEASUREMENT_TYPE: any = {
  length:      'LengthUnit',
  weight:      'WeightUnit',
  temperature: 'TemperatureUnit',
  volume:      'VolumeUnit',
};

function Dashboard() {
  const navigate = useNavigate();

  var [currentType, setCurrentType] = useState('length');
  var [currentAction, setCurrentAction] = useState('comparison');

  // history — never clears
  var [historyList, setHistoryList] = useState<string[]>([]);
  var [showHistory, setShowHistory] = useState(false);

  // comparison
  var [compFromVal, setCompFromVal] = useState(1);
  var [compToVal, setCompToVal] = useState(1000);
  var [compFromUnit, setCompFromUnit] = useState('Feet');
  var [compToUnit, setCompToUnit] = useState('Inches');
  var [compResult, setCompResult] = useState('—');

  // conversion
  var [convVal, setConvVal] = useState(1);
  var [convFromUnit, setConvFromUnit] = useState('Feet');
  var [convToUnit, setConvToUnit] = useState('Inches');
  var [convResult, setConvResult] = useState('—');

  // arithmetic
  var [arithVal1, setArithVal1] = useState(1);
  var [arithVal2, setArithVal2] = useState(1);
  var [arithUnit1, setArithUnit1] = useState('Feet');
  var [arithUnit2, setArithUnit2] = useState('Feet');
  var [arithOp, setArithOp] = useState('+');
  var [arithResultUnit, setArithResultUnit] = useState('Feet');
  var [arithResult, setArithResult] = useState('—');

  function logout() {
    localStorage.removeItem('qm_token');
    localStorage.removeItem('qm_user');
    navigate('/');
  }

  function getUnits() {
    return UNITS[currentType];
  }

  function getBackendUnit(label: string) {
    var units = UNITS[currentType];
    for (var i = 0; i < units.length; i++) {
      if (units[i].label === label) return units[i].backendUnit;
    }
    return label.toUpperCase();
  }

  function selectType(type: string) {
    setCurrentType(type);
    var units = UNITS[type];
    var first = units[0].label;
    var second = units.length > 1 ? units[1].label : units[0].label;
    setCompFromUnit(first);
    setCompToUnit(second);
    setConvFromUnit(first);
    setConvToUnit(second);
    setArithUnit1(first);
    setArithUnit2(first);
    setArithResultUnit(first);
    setCompResult('—');
    setConvResult('—');
    setArithResult('—');
  }

  function addToHistory(entry: string) {
    setHistoryList(function(prev) {
      if (prev[0] === entry) return prev;
      return [entry, ...prev];
    });
  }

  function getBaseValue(unitLabel: string) {
    var baseValues: any = {
      'Feet': 12, 'Inches': 1, 'Yards': 36, 'Centimeters': 0.393701,
      'Kilogram': 1000, 'Gram': 1, 'Milligram': 0.001, 'Pound': 453.592, 'Tonne': 1000000,
      'Litre': 1000, 'Millilitre': 1, 'Gallon': 3785.41,
    };
    return baseValues[unitLabel] || 1;
  }

  function toKelvin(val: number, unit: string) {
    if (unit === 'Celsius') return val + 273.15;
    if (unit === 'Fahrenheit') return (val - 32) * 5 / 9 + 273.15;
    return val;
  }

  function computeComparison() {
    var payload = {
      thisQuantityDTO: {
        value: compFromVal,
        unit: getBackendUnit(compFromUnit),
        measurementType: MEASUREMENT_TYPE[currentType]
      },
      thatQuantityDTO: {
        value: compToVal,
        unit: getBackendUnit(compToUnit),
        measurementType: MEASUREMENT_TYPE[currentType]
      },
      targetUnit: getBackendUnit(compFromUnit)
    };

    compareApi(payload)
      .then(function(data: any) {
        if (data.error) {
          setCompResult('Error: ' + data.errorMessage);
          return;
        }

        var symbol = '';

        if (currentType === 'temperature') {
          var from = toKelvin(compFromVal, compFromUnit);
          var to = toKelvin(compToVal, compToUnit);
          symbol = from < to ? '<' : from > to ? '>' : '=';
        } else {
          var fromBase = compFromVal * getBaseValue(compFromUnit);
          var toBase = compToVal * getBaseValue(compToUnit);
          symbol = fromBase < toBase ? '<' : fromBase > toBase ? '>' : '=';
        }

        var result = compFromVal + ' ' + compFromUnit.toUpperCase() + ' ' + symbol + ' ' + compToVal + ' ' + compToUnit.toUpperCase();
        setCompResult(result);
        addToHistory('[Comparison] ' + result);
      })
      .catch(function() {
        setCompResult('Error');
      });
  }

  function computeConversion() {
    var payload = {
      thisQuantityDTO: {
        value: convVal,
        unit: getBackendUnit(convFromUnit),
        measurementType: MEASUREMENT_TYPE[currentType]
      },
      thatQuantityDTO: {
        value: convVal,
        unit: getBackendUnit(convToUnit),
        measurementType: MEASUREMENT_TYPE[currentType]
      },
      targetUnit: getBackendUnit(convToUnit)
    };

    convertApi(payload)
      .then(function(data: any) {
        if (data.error) {
          setConvResult('Error: ' + data.errorMessage);
          return;
        }
        var result = data.thisValue + ' ' + data.thisUnit + ' = ' + data.resultValue + ' ' + convToUnit.toUpperCase();
        setConvResult(result);
        addToHistory('[Conversion] ' + result);
      })
      .catch(function() {
        setConvResult('Error');
      });
  }

  function computeArithmetic() {
    var payload = {
      thisQuantityDTO: {
        value: arithVal1,
        unit: getBackendUnit(arithUnit1),
        measurementType: MEASUREMENT_TYPE[currentType]
      },
      thatQuantityDTO: {
        value: arithVal2,
        unit: getBackendUnit(arithUnit2),
        measurementType: MEASUREMENT_TYPE[currentType]
      },
      targetUnit: getBackendUnit(arithResultUnit)
    };

    var apiCall: any;
    var opLabel = '';

    if (arithOp === '+') { apiCall = addApi;      opLabel = '+'; }
    if (arithOp === '-') { apiCall = subtractApi; opLabel = '−'; }
    if (arithOp === '*') { apiCall = multiplyApi; opLabel = '×'; }
    if (arithOp === '/') { apiCall = divideApi;   opLabel = '÷'; }

    apiCall(payload)
      .then(function(data: any) {
        if (data.error) {
          if (currentType === 'temperature') {
            setArithResult('⚠️ Arithmetic operations are not supported for Temperature!');
          } else {
            setArithResult('Error: ' + data.errorMessage);
          }
          return;
        }
        var result = data.thisValue + ' ' + data.thisUnit + ' ' + opLabel + ' ' + data.thatValue + ' ' + data.thatUnit + ' = ' + data.resultValue + ' ' + data.resultUnit;
        setArithResult(result);
        addToHistory('[Arithmetic ' + opLabel + '] ' + result);
      })
      .catch(function() {
        setArithResult('This operation is not supported for the selected temperature unit.');
      });
  }

  return (
    <div>

      <header>
        <h1>Welcome To Quantity Measurement</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowHistory(true)}>History</button>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="main">

        <p className="section-title">Choose Type</p>
        <div className="type-grid">
          <div className={'type-card' + (currentType === 'length' ? ' active' : '')} onClick={() => selectType('length')}>
            <span>📏</span><p>Length</p>
          </div>
          <div className={'type-card' + (currentType === 'weight' ? ' active' : '')} onClick={() => selectType('weight')}>
            <span>⚖️</span><p>Weight</p>
          </div>
          <div className={'type-card' + (currentType === 'temperature' ? ' active' : '')} onClick={() => selectType('temperature')}>
            <span>🌡️</span><p>Temperature</p>
          </div>
          <div className={'type-card' + (currentType === 'volume' ? ' active' : '')} onClick={() => selectType('volume')}>
            <span>🧴</span><p>Volume</p>
          </div>
        </div>

        <p className="section-title">Choose Action</p>
        <div className="action-row">
          <button className={'action-btn' + (currentAction === 'comparison' ? ' active' : '')} onClick={() => setCurrentAction('comparison')}>Comparison</button>
          <button className={'action-btn' + (currentAction === 'conversion' ? ' active' : '')} onClick={() => setCurrentAction('conversion')}>Conversion</button>
          <button className={'action-btn' + (currentAction === 'arithmetic' ? ' active' : '')} onClick={() => setCurrentAction('arithmetic')}>Arithmetic</button>
        </div>

        {/* Comparison */}
        {currentAction === 'comparison' && (
          <div className="panel active">
            <div className="two-col">
              <div className="col-block">
                <p className="col-title">Value 1</p>
                <input className="big-input" type="number" value={compFromVal} onChange={(e) => setCompFromVal(parseFloat(e.target.value) || 0)}/>
                <select className="unit-select" value={compFromUnit} onChange={(e) => setCompFromUnit(e.target.value)}>
                  {getUnits().map((u: any) => <option key={u.label} value={u.label}>{u.label}</option>)}
                </select>
              </div>
              <div className="col-block">
                <p className="col-title">Value 2</p>
                <input className="big-input" type="number" value={compToVal} onChange={(e) => setCompToVal(parseFloat(e.target.value) || 0)}/>
                <select className="unit-select" value={compToUnit} onChange={(e) => setCompToUnit(e.target.value)}>
                  {getUnits().map((u: any) => <option key={u.label} value={u.label}>{u.label}</option>)}
                </select>
              </div>
            </div>
            <button className="btn-get-result" onClick={computeComparison}>Get Result</button>
            <div className="result-box">
              <p className="result-title">Result</p>
              <p className="result-text">{compResult}</p>
            </div>
          </div>
        )}

        {/* Conversion */}
        {currentAction === 'conversion' && (
          <div className="panel active">
            <div className="two-col">
              <div className="col-block">
                <p className="col-title">Value</p>
                <input className="big-input" type="number" value={convVal} onChange={(e) => setConvVal(parseFloat(e.target.value) || 0)}/>
                <select className="unit-select" value={convFromUnit} onChange={(e) => setConvFromUnit(e.target.value)}>
                  {getUnits().map((u: any) => <option key={u.label} value={u.label}>{u.label}</option>)}
                </select>
              </div>
              <div className="arrow">→</div>
              <div className="col-block">
                <p className="col-title">Convert To</p>
                <br/>
                <select className="unit-select" value={convToUnit} onChange={(e) => setConvToUnit(e.target.value)}>
                  {getUnits().map((u: any) => <option key={u.label} value={u.label}>{u.label}</option>)}
                </select>
              </div>
            </div>
            <button className="btn-get-result" onClick={computeConversion}>Get Result</button>
            <div className="result-box">
              <p className="result-title">Result</p>
              <p className="result-text">{convResult}</p>
            </div>
          </div>
        )}

        {/* Arithmetic */}
        {currentAction === 'arithmetic' && (
          <div className="panel active">
            <div className="two-col">
              <div className="col-block">
                <p className="col-title">Value 1</p>
                <input className="big-input" type="number" value={arithVal1} onChange={(e) => setArithVal1(parseFloat(e.target.value) || 0)}/>
                <select className="unit-select" value={arithUnit1} onChange={(e) => setArithUnit1(e.target.value)}>
                  {getUnits().map((u: any) => <option key={u.label} value={u.label}>{u.label}</option>)}
                </select>
              </div>
              <div className="op-box">
                <select value={arithOp} onChange={(e) => setArithOp(e.target.value)}>
                  <option value="+">+</option>
                  <option value="-">−</option>
                  <option value="*">×</option>
                  <option value="/">÷</option>
                </select>
              </div>
              <div className="col-block">
                <p className="col-title">Value 2</p>
                <input className="big-input" type="number" value={arithVal2} onChange={(e) => setArithVal2(parseFloat(e.target.value) || 0)}/>
                <select className="unit-select" value={arithUnit2} onChange={(e) => setArithUnit2(e.target.value)}>
                  {getUnits().map((u: any) => <option key={u.label} value={u.label}>{u.label}</option>)}
                </select>
              </div>
            </div>
            <div className="arith-bottom-row">
              <button className="btn-get-result" onClick={computeArithmetic}>Get Result</button>
              <select className="result-unit-select" value={arithResultUnit} onChange={(e) => setArithResultUnit(e.target.value)}>
                {getUnits().map((u: any) => <option key={u.label} value={u.label}>{u.label}</option>)}
              </select>
            </div>
            <div className="result-box">
              <p className="result-title">Result</p>
              <p className="result-text">{arithResult}</p>
            </div>
          </div>
        )}

      </div>

      {/* History Modal */}
      {showHistory && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.4)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', borderRadius: '12px',
            padding: '28px', width: '90%', maxWidth: '500px',
            maxHeight: '70vh', overflowY: 'auto',
            boxShadow: '0 8px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#222' }}>History</h2>
              <button onClick={() => setShowHistory(false)} style={{
                background: 'transparent', border: 'none',
                fontSize: '20px', cursor: 'pointer', color: '#888'
              }}>✕</button>
            </div>

            {historyList.length === 0 ? (
              <p style={{ color: '#888', fontSize: '13px', textAlign: 'center' }}>No history yet!</p>
            ) : (
              historyList.map(function(item, index) {
                return (
                  <div key={index} style={{
                    padding: '10px 14px', marginBottom: '10px',
                    background: '#f8f9ff', borderRadius: '8px',
                    borderLeft: '4px solid #00BFA5',
                    fontSize: '13px', color: '#222'
                  }}>
                    {item}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;