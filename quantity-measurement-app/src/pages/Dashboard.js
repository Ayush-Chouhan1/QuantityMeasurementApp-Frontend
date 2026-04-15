import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { compareApi, convertApi, addApi, subtractApi, multiplyApi, divideApi } from '../api';
import '../styles/Dashboard.css';

const UNITS = {
  length: [
    { label: 'Feet', backendUnit: 'FEET' },
    { label: 'Inches', backendUnit: 'INCHES' },
    { label: 'Yards', backendUnit: 'YARDS' },
    { label: 'Centimeters', backendUnit: 'CENTIMETERS' }
  ],
  weight: [
    { label: 'Kilogram', backendUnit: 'KILOGRAM' },
    { label: 'Gram', backendUnit: 'GRAM' },
    { label: 'Milligram', backendUnit: 'MILLIGRAM' },
    { label: 'Pound', backendUnit: 'POUND' },
    { label: 'Tonne', backendUnit: 'TONNE' }
  ],
  temperature: [
    { label: 'Celsius', backendUnit: 'CELSIUS' },
    { label: 'Fahrenheit', backendUnit: 'FAHRENHEIT' },
    { label: 'Kelvin', backendUnit: 'KELVIN' }
  ],
  volume: [
    { label: 'Litre', backendUnit: 'LITRE' },
    { label: 'Millilitre', backendUnit: 'MILLILITRE' },
    { label: 'Gallon', backendUnit: 'GALLON' }
  ]
};

const MEASUREMENT_TYPE = {
  length: 'LengthUnit',
  weight: 'WeightUnit',
  temperature: 'TemperatureUnit',
  volume: 'VolumeUnit'
};

function Dashboard() {
  const navigate = useNavigate();
  const [currentType, setCurrentType] = useState('length');
  const [currentAction, setCurrentAction] = useState('comparison');
  const [historyList, setHistoryList] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const [compFromVal, setCompFromVal] = useState(1);
  const [compToVal, setCompToVal] = useState(1000);
  const [compFromUnit, setCompFromUnit] = useState('Feet');
  const [compToUnit, setCompToUnit] = useState('Inches');
  const [compResult, setCompResult] = useState('-');

  const [convVal, setConvVal] = useState(1);
  const [convFromUnit, setConvFromUnit] = useState('Feet');
  const [convToUnit, setConvToUnit] = useState('Inches');
  const [convResult, setConvResult] = useState('-');

  const [arithVal1, setArithVal1] = useState(1);
  const [arithVal2, setArithVal2] = useState(1);
  const [arithUnit1, setArithUnit1] = useState('Feet');
  const [arithUnit2, setArithUnit2] = useState('Feet');
  const [arithOp, setArithOp] = useState('+');
  const [arithResultUnit, setArithResultUnit] = useState('Feet');
  const [arithResult, setArithResult] = useState('-');

  function logout() {
    localStorage.removeItem('qm_token');
    localStorage.removeItem('qm_user');
    navigate('/');
  }

  function getUnits() {
    return UNITS[currentType];
  }

  function getBackendUnit(label) {
    const units = UNITS[currentType];
    for (let i = 0; i < units.length; i += 1) {
      if (units[i].label === label) {
        return units[i].backendUnit;
      }
    }
    return label.toUpperCase();
  }

  function selectType(type) {
    const units = UNITS[type];
    const first = units[0].label;
    const second = units.length > 1 ? units[1].label : units[0].label;

    setCurrentType(type);
    setCompFromUnit(first);
    setCompToUnit(second);
    setConvFromUnit(first);
    setConvToUnit(second);
    setArithUnit1(first);
    setArithUnit2(first);
    setArithResultUnit(first);
    setCompResult('-');
    setConvResult('-');
    setArithResult('-');
  }

  function addToHistory(entry) {
    setHistoryList(function (prev) {
      if (prev[0] === entry) {
        return prev;
      }
      return [entry].concat(prev);
    });
  }

  function getBaseValue(unitLabel) {
    const baseValues = {
      Feet: 12,
      Inches: 1,
      Yards: 36,
      Centimeters: 0.393701,
      Kilogram: 1000,
      Gram: 1,
      Milligram: 0.001,
      Pound: 453.592,
      Tonne: 1000000,
      Litre: 1000,
      Millilitre: 1,
      Gallon: 3785.41
    };

    return baseValues[unitLabel] || 1;
  }

  function toKelvin(value, unit) {
    if (unit === 'Celsius') {
      return value + 273.15;
    }
    if (unit === 'Fahrenheit') {
      return ((value - 32) * 5) / 9 + 273.15;
    }
    return value;
  }

  function computeComparison() {
    const payload = {
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
      .then(function (data) {
        if (data.error) {
          setCompResult('Error: ' + data.errorMessage);
          return;
        }

        let symbol = '=';

        if (currentType === 'temperature') {
          const from = toKelvin(compFromVal, compFromUnit);
          const to = toKelvin(compToVal, compToUnit);
          symbol = from < to ? '<' : from > to ? '>' : '=';
        } else {
          const fromBase = compFromVal * getBaseValue(compFromUnit);
          const toBase = compToVal * getBaseValue(compToUnit);
          symbol = fromBase < toBase ? '<' : fromBase > toBase ? '>' : '=';
        }

        const result = compFromVal + ' ' + compFromUnit.toUpperCase() + ' ' + symbol + ' ' + compToVal + ' ' + compToUnit.toUpperCase();
        setCompResult(result);
        addToHistory('[Comparison] ' + result);
      })
      .catch(function () {
        setCompResult('Error');
      });
  }

  function computeConversion() {
    const payload = {
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
      .then(function (data) {
        if (data.error) {
          setConvResult('Error: ' + data.errorMessage);
          return;
        }

        const result = data.thisValue + ' ' + data.thisUnit + ' = ' + data.resultValue + ' ' + convToUnit.toUpperCase();
        setConvResult(result);
        addToHistory('[Conversion] ' + result);
      })
      .catch(function () {
        setConvResult('Error');
      });
  }

  function computeArithmetic() {
    const payload = {
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

    let apiCall = null;
    let opLabel = '';

    if (arithOp === '+') {
      apiCall = addApi;
      opLabel = '+';
    }
    if (arithOp === '-') {
      apiCall = subtractApi;
      opLabel = '-';
    }
    if (arithOp === '*') {
      apiCall = multiplyApi;
      opLabel = '*';
    }
    if (arithOp === '/') {
      apiCall = divideApi;
      opLabel = '/';
    }

    if (!apiCall) {
      setArithResult('Unsupported operation');
      return;
    }

    apiCall(payload)
      .then(function (data) {
        if (data.error) {
          if (currentType === 'temperature') {
            setArithResult('Arithmetic operations are not supported for temperature.');
          } else {
            setArithResult('Error: ' + data.errorMessage);
          }
          return;
        }

        const result = data.thisValue + ' ' + data.thisUnit + ' ' + opLabel + ' ' + data.thatValue + ' ' + data.thatUnit + ' = ' + data.resultValue + ' ' + data.resultUnit;
        setArithResult(result);
        addToHistory('[Arithmetic ' + opLabel + '] ' + result);
      })
      .catch(function () {
        setArithResult('This operation is not supported for the selected unit.');
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
            <span>Length</span><p>Length</p>
          </div>
          <div className={'type-card' + (currentType === 'weight' ? ' active' : '')} onClick={() => selectType('weight')}>
            <span>Weight</span><p>Weight</p>
          </div>
          <div className={'type-card' + (currentType === 'temperature' ? ' active' : '')} onClick={() => selectType('temperature')}>
            <span>Temp</span><p>Temperature</p>
          </div>
          <div className={'type-card' + (currentType === 'volume' ? ' active' : '')} onClick={() => selectType('volume')}>
            <span>Volume</span><p>Volume</p>
          </div>
        </div>

        <p className="section-title">Choose Action</p>
        <div className="action-row">
          <button className={'action-btn' + (currentAction === 'comparison' ? ' active' : '')} onClick={() => setCurrentAction('comparison')}>Comparison</button>
          <button className={'action-btn' + (currentAction === 'conversion' ? ' active' : '')} onClick={() => setCurrentAction('conversion')}>Conversion</button>
          <button className={'action-btn' + (currentAction === 'arithmetic' ? ' active' : '')} onClick={() => setCurrentAction('arithmetic')}>Arithmetic</button>
        </div>

        {currentAction === 'comparison' && (
          <div className="panel active">
            <div className="two-col">
              <div className="col-block">
                <p className="col-title">Value 1</p>
                <input className="big-input" type="number" value={compFromVal} onChange={(e) => setCompFromVal(parseFloat(e.target.value) || 0)} />
                <select className="unit-select" value={compFromUnit} onChange={(e) => setCompFromUnit(e.target.value)}>
                  {getUnits().map((u) => <option key={u.label} value={u.label}>{u.label}</option>)}
                </select>
              </div>
              <div className="col-block">
                <p className="col-title">Value 2</p>
                <input className="big-input" type="number" value={compToVal} onChange={(e) => setCompToVal(parseFloat(e.target.value) || 0)} />
                <select className="unit-select" value={compToUnit} onChange={(e) => setCompToUnit(e.target.value)}>
                  {getUnits().map((u) => <option key={u.label} value={u.label}>{u.label}</option>)}
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

        {currentAction === 'conversion' && (
          <div className="panel active">
            <div className="two-col">
              <div className="col-block">
                <p className="col-title">Value</p>
                <input className="big-input" type="number" value={convVal} onChange={(e) => setConvVal(parseFloat(e.target.value) || 0)} />
                <select className="unit-select" value={convFromUnit} onChange={(e) => setConvFromUnit(e.target.value)}>
                  {getUnits().map((u) => <option key={u.label} value={u.label}>{u.label}</option>)}
                </select>
              </div>
              <div className="arrow">-&gt;</div>
              <div className="col-block">
                <p className="col-title">Convert To</p>
                <br />
                <select className="unit-select" value={convToUnit} onChange={(e) => setConvToUnit(e.target.value)}>
                  {getUnits().map((u) => <option key={u.label} value={u.label}>{u.label}</option>)}
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

        {currentAction === 'arithmetic' && (
          <div className="panel active">
            <div className="two-col">
              <div className="col-block">
                <p className="col-title">Value 1</p>
                <input className="big-input" type="number" value={arithVal1} onChange={(e) => setArithVal1(parseFloat(e.target.value) || 0)} />
                <select className="unit-select" value={arithUnit1} onChange={(e) => setArithUnit1(e.target.value)}>
                  {getUnits().map((u) => <option key={u.label} value={u.label}>{u.label}</option>)}
                </select>
              </div>
              <div className="op-box">
                <select value={arithOp} onChange={(e) => setArithOp(e.target.value)}>
                  <option value="+">+</option>
                  <option value="-">-</option>
                  <option value="*">*</option>
                  <option value="/">/</option>
                </select>
              </div>
              <div className="col-block">
                <p className="col-title">Value 2</p>
                <input className="big-input" type="number" value={arithVal2} onChange={(e) => setArithVal2(parseFloat(e.target.value) || 0)} />
                <select className="unit-select" value={arithUnit2} onChange={(e) => setArithUnit2(e.target.value)}>
                  {getUnits().map((u) => <option key={u.label} value={u.label}>{u.label}</option>)}
                </select>
              </div>
            </div>
            <div className="arith-bottom-row">
              <button className="btn-get-result" onClick={computeArithmetic}>Get Result</button>
              <select className="result-unit-select" value={arithResultUnit} onChange={(e) => setArithResultUnit(e.target.value)}>
                {getUnits().map((u) => <option key={u.label} value={u.label}>{u.label}</option>)}
              </select>
            </div>
            <div className="result-box">
              <p className="result-title">Result</p>
              <p className="result-text">{arithResult}</p>
            </div>
          </div>
        )}
      </div>

      {showHistory && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.4)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '28px',
              width: '90%',
              maxWidth: '500px',
              maxHeight: '70vh',
              overflowY: 'auto',
              boxShadow: '0 8px 40px rgba(0,0,0,0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#222' }}>History</h2>
              <button
                onClick={() => setShowHistory(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#888'
                }}
              >
                x
              </button>
            </div>

            {historyList.length === 0 ? (
              <p style={{ color: '#888', fontSize: '13px', textAlign: 'center' }}>No history yet!</p>
            ) : (
              historyList.map(function (item, index) {
                return (
                  <div
                    key={index}
                    style={{
                      padding: '10px 14px',
                      marginBottom: '10px',
                      background: '#f8f9ff',
                      borderRadius: '8px',
                      borderLeft: '4px solid #00BFA5',
                      fontSize: '13px',
                      color: '#222'
                    }}
                  >
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
