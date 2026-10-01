/* ============================================
   India Finance Calculator - Main JavaScript
   Updated for FY 2025-26 (AY 2026-27)
   ============================================ */

// Indian number format helper
function formatINR(num) {
    return '₹ ' + Math.round(num).toLocaleString('en-IN');
}


/* ============================================
   1. EMI CALCULATOR
   ============================================ */
function calculateEMI() {
    const loanAmount = parseFloat(document.getElementById("loanAmount").value);
    const annualRate = parseFloat(document.getElementById("interestRate").value);
    const years = parseFloat(document.getElementById("loanTenure").value);
    const resultDiv = document.getElementById("emiResult");

    if (!loanAmount || loanAmount <= 0) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Loan amount must be greater than 0.</p>';
        return;
    }
    if (!annualRate || annualRate <= 0 || annualRate > 50) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Interest rate must be between 0 and 50%.</p>';
        return;
    }
    if (!years || years <= 0 || years > 40) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Tenure must be between 1 and 40 years.</p>';
        return;
    }

    const monthlyRate = annualRate / 12 / 100;
    const months = years * 12;

    const emi = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, months)
                / (Math.pow(1 + monthlyRate, months) - 1);

    const totalPayment = emi * months;
    const totalInterest = totalPayment - loanAmount;

    let balance = loanAmount;
    let scheduleHTML = '<h3>Year-wise Breakdown</h3>';
    scheduleHTML += '<div class="table-wrap"><table class="amort-table">';
    scheduleHTML += '<tr><th>Year</th><th>Principal</th><th>Interest</th><th>Balance</th></tr>';

    for (let y = 1; y <= Math.ceil(years); y++) {
        let yearPrincipal = 0, yearInterest = 0;
        for (let m = 0; m < 12 && balance > 0.01; m++) {
            const interestPart = balance * monthlyRate;
            const principalPart = emi - interestPart;
            yearPrincipal += principalPart;
            yearInterest += interestPart;
            balance -= principalPart;
        }
        scheduleHTML += `<tr>
            <td>Year ${y}</td>
            <td>${formatINR(yearPrincipal)}</td>
            <td>${formatINR(yearInterest)}</td>
            <td>${formatINR(Math.max(0, balance))}</td>
        </tr>`;
    }
    scheduleHTML += '</table></div>';

    resultDiv.innerHTML = `
        <h2>EMI Result</h2>

        <div class="emi-result-grid">
            <div class="emi-result-card">
                <span>Monthly EMI</span>
                <strong>${formatINR(emi)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Total Interest</span>
                <strong>${formatINR(totalInterest)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Total Payment</span>
                <strong>${formatINR(totalPayment)}</strong>
            </div>
        </div>

        ${scheduleHTML}

        <p class="note">💡 Tip: A higher down payment or shorter tenure reduces total interest.</p>

        <a href="index.html" class="back-link">← Back to Home</a>
    `;
}


/* ============================================
   2. GST CALCULATOR
   ============================================ */
function calculateGST() {
    const amount = parseFloat(document.getElementById("gstAmount").value);
    const rate = parseFloat(document.getElementById("gstRate").value);
    const type = document.getElementById("gstType").value;
    const resultDiv = document.getElementById("gstResult");

    if (!amount || amount <= 0) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Amount must be greater than 0.</p>';
        return;
    }

    let netPrice, gstAmount, grossPrice;

    if (type === "add") {
        netPrice = amount;
        gstAmount = amount * rate / 100;
        grossPrice = amount + gstAmount;
    } else {
        grossPrice = amount;
        netPrice = amount * 100 / (100 + rate);
        gstAmount = grossPrice - netPrice;
    }

    resultDiv.innerHTML = `
        <h2>GST Result</h2>

        <div class="emi-result-grid">
            <div class="emi-result-card">
                <span>Net Price</span>
                <strong>${formatINR(netPrice)}</strong>
            </div>
            <div class="emi-result-card">
                <span>GST Amount (${rate}%)</span>
                <strong>${formatINR(gstAmount)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Gross Price</span>
                <strong>${formatINR(grossPrice)}</strong>
            </div>
        </div>

        <p class="note">💡 Tip: GST rates in India are 5%, 12%, 18%, and 28%.</p>

        <a href="index.html" class="back-link">← Back to Home</a>
    `;
}


/* ============================================
   3. SIP CALCULATOR
   ============================================ */
function calculateSIP() {
    const monthly = parseFloat(document.getElementById("sipAmount").value);
    const annualRate = parseFloat(document.getElementById("sipRate").value);
    const years = parseFloat(document.getElementById("sipYears").value);
    const resultDiv = document.getElementById("sipResult");

    if (!monthly || monthly <= 0) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Monthly investment must be greater than 0.</p>';
        return;
    }
    if (!annualRate || annualRate <= 0 || annualRate > 50) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Return rate must be between 0 and 50%.</p>';
        return;
    }
    if (!years || years <= 0 || years > 50) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Period must be between 1 and 50 years.</p>';
        return;
    }

    const monthlyRate = annualRate / 12 / 100;
    const months = years * 12;

    const futureValue = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    const invested = monthly * months;
    const returns = futureValue - invested;

    resultDiv.innerHTML = `
        <h2>SIP Result</h2>

        <div class="emi-result-grid">
            <div class="emi-result-card">
                <span>Invested Amount</span>
                <strong>${formatINR(invested)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Estimated Returns</span>
                <strong>${formatINR(returns)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Maturity Value</span>
                <strong>${formatINR(futureValue)}</strong>
            </div>
        </div>

        <p class="note">💡 Tip: The longer you stay invested in SIP, the more you benefit from compounding.</p>

        <a href="index.html" class="back-link">← Back to Home</a>
    `;
}


/* ============================================
   4. FD CALCULATOR
   ============================================ */
function calculateFD() {
    const principal = parseFloat(document.getElementById("fdAmount").value);
    const annualRate = parseFloat(document.getElementById("fdRate").value);
    const years = parseFloat(document.getElementById("fdYears").value);
    const n = parseFloat(document.getElementById("fdCompound").value);
    const resultDiv = document.getElementById("fdResult");

    if (!principal || principal <= 0) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Deposit amount must be greater than 0.</p>';
        return;
    }
    if (!annualRate || annualRate <= 0 || annualRate > 20) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Interest rate must be between 0 and 20%.</p>';
        return;
    }
    if (!years || years <= 0 || years > 20) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Time period must be between 0.5 and 20 years.</p>';
        return;
    }

    const rate = annualRate / 100;
    const maturity = principal * Math.pow(1 + rate / n, n * years);
    const interest = maturity - principal;

    resultDiv.innerHTML = `
        <h2>FD Result</h2>

        <div class="emi-result-grid">
            <div class="emi-result-card">
                <span>Principal</span>
                <strong>${formatINR(principal)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Interest Earned</span>
                <strong>${formatINR(interest)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Maturity Amount</span>
                <strong>${formatINR(maturity)}</strong>
            </div>
        </div>

        <p class="note">💡 Tip: FD interest is taxable. TDS applies if interest exceeds ₹40,000 per year.</p>

        <a href="index.html" class="back-link">← Back to Home</a>
    `;
}


/* ============================================
   5. SALARY CALCULATOR
   ============================================ */
function calculateSalary() {
    const basic = parseFloat(document.getElementById("basicSalary").value) || 0;
    const hra = parseFloat(document.getElementById("hra").value) || 0;
    const special = parseFloat(document.getElementById("specialAllowance").value) || 0;
    const otherAllow = parseFloat(document.getElementById("otherAllowances").value) || 0;
    const empPF = parseFloat(document.getElementById("empPF").value) || 0;
    const profTax = parseFloat(document.getElementById("profTax").value) || 0;
    const otherDed = parseFloat(document.getElementById("otherDeductions").value) || 0;
    const applyTax = document.getElementById("applyTax").value;
    const resultDiv = document.getElementById("salaryResult");

    if (basic <= 0) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Basic salary must be greater than 0.</p>';
        return;
    }

    const grossMonthly = basic + hra + special + otherAllow;
    const grossAnnual = grossMonthly * 12;

    let annualTax = 0;
    if (applyTax === "yes") {
        // New Regime FY 2025-26 with ₹75,000 standard deduction
        const taxableIncome = Math.max(0, grossAnnual - 75000);
        const slabs = [
            [400000, 0],
            [800000, 0.05],
            [1200000, 0.10],
            [1600000, 0.15],
            [2000000, 0.20],
            [2400000, 0.25],
            [Infinity, 0.30]
        ];
        let prev = 0;
        for (let [limit, rate] of slabs) {
            if (taxableIncome > prev) {
                const amt = Math.min(taxableIncome, limit) - prev;
                annualTax += amt * rate;
                prev = limit;
            }
        }
        // Section 87A Rebate: taxable income up to ₹12,00,000, max rebate ₹60,000
        if (taxableIncome <= 1200000) {
            annualTax = Math.max(0, annualTax - 60000);
        }
        // 4% Health & Education Cess
        annualTax = annualTax * 1.04;
    }
    const monthlyTax = annualTax / 12;

    const totalDeductions = empPF + profTax + otherDed + monthlyTax;
    const netMonthly = grossMonthly - totalDeductions;
    const netAnnual = netMonthly * 12;

    resultDiv.innerHTML = `
        <h2>Salary Breakdown</h2>

        <div class="emi-result-grid">
            <div class="emi-result-card">
                <span>Monthly In-Hand</span>
                <strong>${formatINR(netMonthly)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Annual In-Hand</span>
                <strong>${formatINR(netAnnual)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Total Deductions</span>
                <strong>${formatINR(totalDeductions)}</strong>
            </div>
        </div>

        <h3>Detailed Breakdown (Monthly)</h3>
        <div class="table-wrap">
            <table class="amort-table">
                <tr><th>Component</th><th>Amount</th></tr>
                <tr><td>Basic Salary</td><td>${formatINR(basic)}</td></tr>
                <tr><td>HRA</td><td>${formatINR(hra)}</td></tr>
                <tr><td>Special Allowance</td><td>${formatINR(special)}</td></tr>
                <tr><td>Other Allowances</td><td>${formatINR(otherAllow)}</td></tr>
                <tr><td><strong>Gross Monthly Salary</strong></td><td><strong>${formatINR(grossMonthly)}</strong></td></tr>
                <tr><td>Employee PF</td><td>- ${formatINR(empPF)}</td></tr>
                <tr><td>Professional Tax</td><td>- ${formatINR(profTax)}</td></tr>
                <tr><td>Other Deductions</td><td>- ${formatINR(otherDed)}</td></tr>
                <tr><td>Income Tax (New Regime)</td><td>- ${formatINR(monthlyTax)}</td></tr>
                <tr><td><strong>Net Monthly In-Hand</strong></td><td><strong>${formatINR(netMonthly)}</strong></td></tr>
            </table>
        </div>

        <p class="note">💡 Tip: Tax is calculated using the New Regime with ₹75,000 standard deduction. Verify PF and other deductions from your salary slip.</p>

        <a href="index.html" class="back-link">← Back to Home</a>
    `;
}


/* ============================================
   6. INCOME TAX CALCULATOR
   Old Regime vs New Regime — FY 2025-26
   ============================================ */

function calcOldRegime(income, age, ded) {
    const taxable = Math.max(0, income - 50000 - ded);
    let tax = 0;
    let slabs = [];

    if (age === "below60") {
        // Below 60 years
        slabs = [
            [250000, 0],
            [500000, 0.05],
            [1000000, 0.20],
            [Infinity, 0.30]
        ];
    } else if (age === "60to80") {
        // Senior citizens (60-80)
        slabs = [
            [300000, 0],
            [500000, 0.05],
            [1000000, 0.20],
            [Infinity, 0.30]
        ];
    } else {
        // Super senior citizens (80+)
        slabs = [
            [500000, 0],
            [1000000, 0.20],
            [Infinity, 0.30]
        ];
    }

    let prev = 0;
    for (let [limit, rate] of slabs) {
        if (taxable > prev) {
            const amt = Math.min(taxable, limit) - prev;
            tax += amt * rate;
            prev = limit;
        }
    }

    // Section 87A Rebate (Old Regime): taxable income up to ₹5,00,000, max rebate ₹12,500
    if (taxable <= 500000) {
        tax = Math.max(0, tax - 12500);
    }

    return tax;
}

function calcNewRegime(income) {
    // New Regime FY 2025-26 with ₹75,000 standard deduction
    const taxable = Math.max(0, income - 75000);
    const slabs = [
        [400000, 0],
        [800000, 0.05],
        [1200000, 0.10],
        [1600000, 0.15],
        [2000000, 0.20],
        [2400000, 0.25],
        [Infinity, 0.30]
    ];
    let tax = 0, prev = 0;
    for (let [limit, rate] of slabs) {
        if (taxable > prev) {
            const amt = Math.min(taxable, limit) - prev;
            tax += amt * rate;
            prev = limit;
        }
    }

    // Section 87A Rebate (New Regime): taxable income up to ₹12,00,000, max rebate ₹60,000
    if (taxable <= 1200000) {
        tax = Math.max(0, tax - 60000);
    }

    return tax;
}

function calculateIncomeTax() {
    const income = parseFloat(document.getElementById("taxIncome").value) || 0;
    const age = document.getElementById("taxAge").value;
    const ded = (parseFloat(document.getElementById("ded80c").value) || 0)
              + (parseFloat(document.getElementById("ded80d").value) || 0)
              + (parseFloat(document.getElementById("ded24b").value) || 0)
              + (parseFloat(document.getElementById("dednps").value) || 0);
    const resultDiv = document.getElementById("taxResult");

    if (!income || income <= 0) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Annual income must be greater than 0.</p>';
        return;
    }

    const oldTax = calcOldRegime(income, age, ded);
    const newTax = calcNewRegime(income);

    // 4% Health & Education Cess
    const oldTotal = oldTax * 1.04;
    const newTotal = newTax * 1.04;

    const better = oldTotal < newTotal ? "Old" : "New";
    const saving = Math.abs(oldTotal - newTotal);

    resultDiv.innerHTML = `
        <h2>Tax Comparison (FY 2025-26)</h2>

        <div class="table-wrap">
            <table class="amort-table">
                <tr><th>Particulars</th><th>Old Regime</th><th>New Regime</th></tr>
                <tr><td>Gross Income</td><td>${formatINR(income)}</td><td>${formatINR(income)}</td></tr>
                <tr><td>Deductions</td><td>${formatINR(50000 + ded)}</td><td>${formatINR(75000)}</td></tr>
                <tr><td>Taxable Income</td><td>${formatINR(Math.max(0, income - 50000 - ded))}</td><td>${formatINR(Math.max(0, income - 75000))}</td></tr>
                <tr><td>Income Tax (before rebate)</td><td>${formatINR(oldTax + (Math.max(0, income - 50000 - ded) <= 500000 ? 12500 : 0))}</td><td>${formatINR(newTax + (Math.max(0, income - 75000) <= 1200000 ? 60000 : 0))}</td></tr>
                <tr><td>Section 87A Rebate</td><td>- ${formatINR(Math.max(0, income - 50000 - ded) <= 500000 ? 12500 : 0)}</td><td>- ${formatINR(Math.max(0, income - 75000) <= 1200000 ? 60000 : 0)}</td></tr>
                <tr><td>Tax after Rebate</td><td>${formatINR(oldTax)}</td><td>${formatINR(newTax)}</td></tr>
                <tr><td>Cess (4%)</td><td>${formatINR(oldTax * 0.04)}</td><td>${formatINR(newTax * 0.04)}</td></tr>
                <tr><td><strong>Total Tax</strong></td><td><strong>${formatINR(oldTotal)}</strong></td><td><strong>${formatINR(newTotal)}</strong></td></tr>
            </table>
        </div>

        <p class="note">✅ <strong>${better} Regime</strong> is better for you — You save ${formatINR(saving)}!</p>

        <a href="index.html" class="back-link">← Back to Home</a>
    `;
}

/* ============================================
   7. LOAN ELIGIBILITY CALCULATOR (English)
   ============================================ */
function calculateLoanEligibility() {
    const monthlyIncome = parseFloat(document.getElementById("monthlyIncome").value) || 0;
    const existingEmi = parseFloat(document.getElementById("existingEmi").value) || 0;
    const loanType = document.getElementById("loanType").value;
    const annualRate = parseFloat(document.getElementById("loanRate").value) || 0;
    const years = parseFloat(document.getElementById("loanTenure").value) || 0;
    const age = parseFloat(document.getElementById("age").value) || 0;
    const resultDiv = document.getElementById("loanResult");

    if (!monthlyIncome || monthlyIncome <= 0) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Monthly income must be greater than 0.</p>';
        return;
    }
    if (!annualRate || annualRate <= 0) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Interest rate must be greater than 0.</p>';
        return;
    }
    if (!years || years <= 0) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Tenure must be greater than 0.</p>';
        return;
    }
    if (age < 21 || age > 65) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Age must be between 21 and 65.</p>';
        return;
    }

    // FOIR based on loan type
    let foir = 0.50;
    if (loanType === "car") foir = 0.40;
    if (loanType === "personal") foir = 0.35;

    // Max EMI possible
    const maxEmi = (monthlyIncome * foir) - existingEmi;

    if (maxEmi <= 0) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Your existing EMIs are too high. No additional loan possible.</p>';
        return;
    }

    // Max loan based on EMI capacity
    const monthlyRate = annualRate / 12 / 100;
    const months = years * 12;
    const maxLoan = maxEmi * (Math.pow(1 + monthlyRate, months) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, months));

    // Age-based tenure check
    const maxTenureByAge = 65 - age;
    let tenureWarning = "";
    if (years > maxTenureByAge) {
        tenureWarning = `<p class="note" style="background:#fff3cd;">⚠️ Note: Banks usually cap loan tenure so it ends by age 65. Based on your age (${age}), max tenure is about ${maxTenureByAge} years.</p>`;
    }

    // Total interest
    const totalPayment = maxEmi * months;
    const totalInterest = totalPayment - maxLoan;

    resultDiv.innerHTML = `
        <h2>Loan Eligibility Result</h2>

        <div class="emi-result-grid">
            <div class="emi-result-card">
                <span>Maximum Loan</span>
                <strong>${formatINR(maxLoan)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Max Monthly EMI</span>
                <strong>${formatINR(maxEmi)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Total Interest</span>
                <strong>${formatINR(totalInterest)}</strong>
            </div>
        </div>

        <p class="note">💡 Your FOIR for this loan type is <strong>${(foir * 100)}%</strong>. Existing EMIs of ${formatINR(existingEmi)} have been deducted.</p>
        ${tenureWarning}

        <a href="index.html" class="back-link">← Back to Home</a>
    `;
}

/* ============================================
   8. GRATUITY CALCULATOR (English)
   ============================================ */
function calculateGratuity() {
    const lastSalary = parseFloat(document.getElementById("lastSalary").value) || 0;
    const serviceYears = parseFloat(document.getElementById("serviceYears").value) || 0;
    const resultDiv = document.getElementById("gratuityResult");

    if (!lastSalary || lastSalary <= 0) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Salary must be greater than 0.</p>';
        return;
    }
    if (!serviceYears || serviceYears <= 0) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Years of service must be greater than 0.</p>';
        return;
    }
    if (serviceYears < 5) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Minimum 5 years of continuous service is required to be eligible for gratuity.</p>';
        return;
    }

    // Round off service years: >6 months = next year, <6 months = ignore
    const decimal = serviceYears - Math.floor(serviceYears);
    let roundedYears;
    if (decimal >= 0.5) {
        roundedYears = Math.ceil(serviceYears);
    } else {
        roundedYears = Math.floor(serviceYears);
    }

    // Gratuity formula
    const gratuity = (15 * lastSalary * roundedYears) / 26;

    // Tax exemption
    const taxExemptLimit = 2000000; // ₹20 lakh
    const taxableAmount = Math.max(0, gratuity - taxExemptLimit);

    resultDiv.innerHTML = `
        <h2>Gratuity Result</h2>

        <div class="emi-result-grid">
            <div class="emi-result-card">
                <span>Gratuity Amount</span>
                <strong>${formatINR(gratuity)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Service Years (rounded)</span>
                <strong>${roundedYears} years</strong>
            </div>
            <div class="emi-result-card">
                <span>Taxable Amount</span>
                <strong>${formatINR(taxableAmount)}</strong>
            </div>
        </div>

        <p class="note">💡 Gratuity up to ₹20 lakh is tax-exempt. Amount above ₹20 lakh is taxable.</p>
        <p class="note">📊 Formula: (15 × ₹${lastSalary.toLocaleString('en-IN')} × ${roundedYears}) / 26 = ${formatINR(gratuity)}</p>

        <a href="index.html" class="back-link">← Back to Home</a>
    `;
}

/* ============================================
   9. INSURANCE CALCULATOR (English)
   ============================================ */
function calculateInsurance() {
    const age = parseFloat(document.getElementById("insAge").value) || 0;
    const income = parseFloat(document.getElementById("insIncome").value) || 0;
    const childAge = parseFloat(document.getElementById("insChildAge").value) || 0;
    const loans = parseFloat(document.getElementById("insLoans").value) || 0;
    const savings = parseFloat(document.getElementById("insSavings").value) || 0;
    const gender = document.getElementById("insGender").value;
    const smoker = document.getElementById("insSmoker").value;
    const resultDiv = document.getElementById("insuranceResult");

    if (!age || age < 18 || age > 65) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Age must be between 18 and 65.</p>';
        return;
    }
    if (!income || income <= 0) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Annual income must be greater than 0.</p>';
        return;
    }

    // Human Life Value calculation
    let cover = income * 15;

    // Add outstanding loans
    cover += loans;

    // Add child education corpus
    if (childAge > 0) {
        const yearsToGrad = 21 - childAge;
        const educationCost = 1500000; // ₹15 lakh assumed
        cover += educationCost;
    }

    // Subtract current savings
    cover -= savings;

    // Minimum cover
    if (cover < income * 10) {
        cover = income * 10;
    }

    // Round to nearest lakh
    cover = Math.round(cover / 100000) * 100000;

    // Estimate premium (indicative rates)
    let ratePerLakh = 0;
    if (age <= 25) ratePerLakh = 80;
    else if (age <= 30) ratePerLakh = 100;
    else if (age <= 35) ratePerLakh = 130;
    else if (age <= 40) ratePerLakh = 180;
    else if (age <= 45) ratePerLakh = 260;
    else if (age <= 50) ratePerLakh = 400;
    else if (age <= 55) ratePerLakh = 650;
    else ratePerLakh = 1000;

    if (gender === "female") ratePerLakh = ratePerLakh * 0.85;
    if (smoker === "yes") ratePerLakh = ratePerLakh * 1.6;

    const annualPremium = (cover / 100000) * ratePerLakh;

    resultDiv.innerHTML = `
        <h2>Insurance Recommendation</h2>

        <div class="emi-result-grid">
            <div class="emi-result-card">
                <span>Recommended Cover</span>
                <strong>${formatINR(cover)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Estimated Annual Premium</span>
                <strong>${formatINR(annualPremium)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Monthly Cost</span>
                <strong>${formatINR(annualPremium / 12)}</strong>
            </div>
        </div>

        <p class="note">💡 This is an indicative estimate. Actual premium depends on your medical history, the insurer, and policy terms.</p>
        <p class="note">📊 Cover = (Income × 15) + Loans + Child Education − Savings</p>

        <a href="index.html" class="back-link">← Back to Home</a>
    `;
}

/* ============================================
   10. NPS CALCULATOR (English)
   ============================================ */
function calculateNPS() {
    const age = parseFloat(document.getElementById("npsAge").value) || 0;
    const monthly = parseFloat(document.getElementById("npsMonthly").value) || 0;
    const annualReturn = parseFloat(document.getElementById("npsReturn").value) || 0;
    const retireAge = parseFloat(document.getElementById("npsRetireAge").value) || 60;
    const resultDiv = document.getElementById("npsResult");

    if (!age || age < 18 || age > 60) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Age must be between 18 and 60.</p>';
        return;
    }
    if (!monthly || monthly < 500) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Minimum monthly contribution is ₹500.</p>';
        return;
    }
    if (!annualReturn || annualReturn < 1 || annualReturn > 30) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Return rate must be between 1% and 30%.</p>';
        return;
    }
    if (retireAge <= age) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Retirement age must be greater than current age.</p>';
        return;
    }

    const years = retireAge - age;
    const months = years * 12;
    const monthlyRate = annualReturn / 12 / 100;

    // Future value of SIP (monthly contributions)
    const corpus = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);

    // Total invested
    const invested = monthly * months;

    // Returns earned
    const returns = corpus - invested;

    // At retirement: 60% lump sum, 40% annuity
    const lumpSum = corpus * 0.60;
    const annuityCorpus = corpus * 0.40;

    // Estimated monthly pension (assume 6% annuity rate)
    const annuityRate = 0.06;
    const monthlyPension = (annuityCorpus * annuityRate) / 12;

    resultDiv.innerHTML = `
        <h2>NPS Result</h2>

        <div class="emi-result-grid">
            <div class="emi-result-card">
                <span>Total Invested</span>
                <strong>${formatINR(invested)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Estimated Returns</span>
                <strong>${formatINR(returns)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Total Corpus</span>
                <strong>${formatINR(corpus)}</strong>
            </div>
        </div>

        <h3>At Retirement (Age ${retireAge})</h3>
        <div class="emi-result-grid">
            <div class="emi-result-card">
                <span>60% Lump Sum (Tax-free)</span>
                <strong>${formatINR(lumpSum)}</strong>
            </div>
            <div class="emi-result-card">
                <span>40% Annuity Corpus</span>
                <strong>${formatINR(annuityCorpus)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Est. Monthly Pension</span>
                <strong>${formatINR(monthlyPension)}</strong>
            </div>
        </div>

        <p class="note">💡 Pension is estimated at 6% annuity rate. Actual rates vary by insurer and annuity option.</p>
        <p class="note">📊 Tax benefit: Additional ₹50,000 deduction under Section 80CCD(1B) in Old Regime.</p>

        <a href="index.html" class="back-link">← Back to Home</a>
    `;
}

/* ============================================
   11. SWP CALCULATOR (English)
   ============================================ */
function calculateSWP() {
    const investment = parseFloat(document.getElementById("swpInvestment").value) || 0;
    const monthlyWithdrawal = parseFloat(document.getElementById("swpWithdrawal").value) || 0;
    const annualReturn = parseFloat(document.getElementById("swpReturn").value) || 0;
    const years = parseFloat(document.getElementById("swpYears").value) || 0;
    const resultDiv = document.getElementById("swpResult");

    if (!investment || investment <= 0) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Investment must be greater than 0.</p>';
        return;
    }
    if (!monthlyWithdrawal || monthlyWithdrawal <= 0) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Monthly withdrawal must be greater than 0.</p>';
        return;
    }
    if (!annualReturn || annualReturn < 1 || annualReturn > 30) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Return rate must be between 1% and 30%.</p>';
        return;
    }
    if (!years || years <= 0 || years > 40) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Period must be between 1 and 40 years.</p>';
        return;
    }

    const monthlyRate = annualReturn / 12 / 100;
    const months = years * 12;

    let balance = investment;
    let totalWithdrawn = 0;
    let monthsLasted = 0;
    let depleted = false;

    for (let m = 0; m < months; m++) {
        // Add monthly return
        balance = balance * (1 + monthlyRate);
        // Withdraw
        if (balance >= monthlyWithdrawal) {
            balance -= monthlyWithdrawal;
            totalWithdrawn += monthlyWithdrawal;
            monthsLasted++;
        } else {
            totalWithdrawn += balance;
            balance = 0;
            depleted = true;
            monthsLasted++;
            break;
        }
    }

    const finalBalance = balance;
    const yearsLasted = (monthsLasted / 12).toFixed(1);

    let statusMsg = "";
    if (depleted) {
        statusMsg = `<p class="note" style="background:#fff3cd;">⚠️ Your corpus will be depleted in approximately <strong>${yearsLasted} years</strong>. Consider reducing your monthly withdrawal.</p>`;
    } else {
        statusMsg = `<p class="note">✅ Your corpus will last the full ${years} years with ${formatINR(finalBalance)} remaining.</p>`;
    }

    resultDiv.innerHTML = `
        <h2>SWP Result</h2>

        <div class="emi-result-grid">
            <div class="emi-result-card">
                <span>Total Withdrawn</span>
                <strong>${formatINR(totalWithdrawn)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Remaining Corpus</span>
                <strong>${formatINR(finalBalance)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Corpus Duration</span>
                <strong>${yearsLasted} years</strong>
            </div>
        </div>

        ${statusMsg}

        <p class="note">📊 Initial Investment: ${formatINR(investment)} | Monthly Withdrawal: ${formatINR(monthlyWithdrawal)} | Expected Return: ${annualReturn}%</p>

        <a href="index.html" class="back-link">← Back to Home</a>
    `;
}

/* ============================================
   12. LUMPSUM CALCULATOR (English)
   ============================================ */
function calculateLumpsum() {
    const amount = parseFloat(document.getElementById("lsAmount").value) || 0;
    const annualReturn = parseFloat(document.getElementById("lsReturn").value) || 0;
    const years = parseFloat(document.getElementById("lsYears").value) || 0;
    const resultDiv = document.getElementById("lsResult");

    if (!amount || amount <= 0) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Investment amount must be greater than 0.</p>';
        return;
    }
    if (!annualReturn || annualReturn < 1 || annualReturn > 30) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Return rate must be between 1% and 30%.</p>';
        return;
    }
    if (!years || years <= 0 || years > 40) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Period must be between 1 and 40 years.</p>';
        return;
    }

    // Compound interest formula: A = P × (1 + r)^n
    const rate = annualReturn / 100;
    const maturity = amount * Math.pow(1 + rate, years);
    const returns = maturity - amount;

    // Effective annual growth
    const growthMultiple = maturity / amount;

    resultDiv.innerHTML = `
        <h2>Lumpsum Result</h2>

        <div class="emi-result-grid">
            <div class="emi-result-card">
                <span>Invested Amount</span>
                <strong>${formatINR(amount)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Estimated Returns</span>
                <strong>${formatINR(returns)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Maturity Value</span>
                <strong>${formatINR(maturity)}</strong>
            </div>
        </div>

        <p class="note">💡 Your money grows <strong>${growthMultiple.toFixed(2)}x</strong> in ${years} years at ${annualReturn}% annual return.</p>
        <p class="note">📊 Formula: ${formatINR(amount)} × (1 + ${annualReturn}%)^${years} = ${formatINR(maturity)}</p>
        <p class="note">⚠️ Returns are market-linked and not guaranteed. This is an estimate.</p>

        <a href="index.html" class="back-link">← Back to Home</a>
    `;
}

/* ============================================
   13. CAGR CALCULATOR (English)
   ============================================ */
function calculateCAGR() {
    const initial = parseFloat(document.getElementById("cagrInitial").value) || 0;
    const final = parseFloat(document.getElementById("cagrFinal").value) || 0;
    const years = parseFloat(document.getElementById("cagrYears").value) || 0;
    const resultDiv = document.getElementById("cagrResult");

    if (!initial || initial <= 0) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Initial value must be greater than 0.</p>';
        return;
    }
    if (!final || final <= 0) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Final value must be greater than 0.</p>';
        return;
    }
    if (!years || years <= 0 || years > 50) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Period must be between 0.5 and 50 years.</p>';
        return;
    }

    // CAGR formula: [(Final / Initial)^(1/n) - 1] × 100
    const cagr = (Math.pow(final / initial, 1 / years) - 1) * 100;
    const absoluteReturn = ((final - initial) / initial) * 100;
    const totalGain = final - initial;

    resultDiv.innerHTML = `
        <h2>CAGR Result</h2>

        <div class="emi-result-grid">
            <div class="emi-result-card">
                <span>CAGR</span>
                <strong>${cagr.toFixed(2)}%</strong>
            </div>
            <div class="emi-result-card">
                <span>Absolute Return</span>
                <strong>${absoluteReturn.toFixed(2)}%</strong>
            </div>
            <div class="emi-result-card">
                <span>Total Gain</span>
                <strong>${formatINR(totalGain)}</strong>
            </div>
        </div>

        <p class="note">💡 Your investment grew at an average rate of <strong>${cagr.toFixed(2)}% per year</strong> over ${years} years.</p>
        <p class="note">📊 Formula: [(${formatINR(final)} / ${formatINR(initial)})^(1/${years}) − 1] × 100 = ${cagr.toFixed(2)}%</p>

        <a href="index.html" class="back-link">← Back to Home</a>
    `;
}

/* ============================================
   14. PPF CALCULATOR (English)
   ============================================ */
function calculatePPF() {
    const yearlyAmount = parseFloat(document.getElementById("ppfAmount").value) || 0;
    const annualRate = parseFloat(document.getElementById("ppfRate").value) || 0;
    const years = parseFloat(document.getElementById("ppfYears").value) || 0;
    const resultDiv = document.getElementById("ppfResult");

    if (!yearlyAmount || yearlyAmount < 500) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Minimum yearly investment is ₹500.</p>';
        return;
    }
    if (yearlyAmount > 150000) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Maximum yearly investment is ₹1,50,000.</p>';
        return;
    }
    if (!annualRate || annualRate < 1 || annualRate > 15) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Interest rate must be between 1% and 15%.</p>';
        return;
    }
    if (!years || years <= 0 || years > 50) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Period must be between 1 and 50 years.</p>';
        return;
    }

    // PPF calculation: yearly investment compounded annually
    const rate = annualRate / 100;
    let balance = 0;
    let totalInvested = 0;

    for (let y = 0; y < years; y++) {
        balance = (balance + yearlyAmount) * (1 + rate);
        totalInvested += yearlyAmount;
    }

    const interest = balance - totalInvested;

    resultDiv.innerHTML = `
        <h2>PPF Result</h2>

        <div class="emi-result-grid">
            <div class="emi-result-card">
                <span>Total Invested</span>
                <strong>${formatINR(totalInvested)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Interest Earned</span>
                <strong>${formatINR(interest)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Maturity Amount</span>
                <strong>${formatINR(balance)}</strong>
            </div>
        </div>

        <p class="note">💡 Tax-free returns: Investment + Interest + Maturity all exempt under EEE.</p>
        <p class="note">📊 Investment under Section 80C eligible for deduction up to ₹1.5 lakh (Old Regime).</p>
        <p class="note">⚠️ PPF interest rates are revised quarterly. Rate used: ${annualRate}%</p>

        <a href="index.html" class="back-link">← Back to Home</a>
    `;
}

/* ============================================
   15. HRA CALCULATOR (English)
   ============================================ */
function calculateHRA() {
    const basic = parseFloat(document.getElementById("hraBasic").value) || 0;
    const da = parseFloat(document.getElementById("hraDA").value) || 0;
    const hraReceived = parseFloat(document.getElementById("hraReceived").value) || 0;
    const rentPaid = parseFloat(document.getElementById("hraRent").value) || 0;
    const cityType = document.getElementById("hraCity").value;
    const resultDiv = document.getElementById("hraResult");

    if (!basic || basic <= 0) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Basic salary must be greater than 0.</p>';
        return;
    }
    if (!hraReceived || hraReceived <= 0) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ HRA received must be greater than 0.</p>';
        return;
    }
    if (!rentPaid || rentPaid <= 0) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Rent paid must be greater than 0.</p>';
        return;
    }

    const basicPlusDA = basic + da;
    const annualBasicPlusDA = basicPlusDA * 12;
    const annualHRAReceived = hraReceived * 12;
    const annualRentPaid = rentPaid * 12;

    // Three conditions
    const condition1 = annualHRAReceived;
    const condition2 = Math.max(0, annualRentPaid - (annualBasicPlusDA * 0.10));
    const cityPercent = cityType === "metro" ? 0.50 : 0.40;
    const condition3 = annualBasicPlusDA * cityPercent;

    // Exempt HRA = minimum of three
    const exemptHRA = Math.min(condition1, condition2, condition3);
    const taxableHRA = annualHRAReceived - exemptHRA;

    resultDiv.innerHTML = `
        <h2>HRA Exemption Result</h2>

        <div class="emi-result-grid">
            <div class="emi-result-card">
                <span>Annual HRA Received</span>
                <strong>${formatINR(annualHRAReceived)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Exempt HRA</span>
                <strong>${formatINR(exemptHRA)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Taxable HRA</span>
                <strong>${formatINR(taxableHRA)}</strong>
            </div>
        </div>

        <h3>Exemption Calculation Breakdown</h3>
        <div class="table-wrap">
            <table class="amort-table">
                <tr><th>Condition</th><th>Amount</th></tr>
                <tr><td>1. Actual HRA Received</td><td>${formatINR(condition1)}</td></tr>
                <tr><td>2. Rent Paid − 10% of Basic+DA</td><td>${formatINR(condition2)}</td></tr>
                <tr><td>3. ${cityPercent * 100}% of Basic+DA (${cityType})</td><td>${formatINR(condition3)}</td></tr>
                <tr><td><strong>Exempt HRA (minimum)</strong></td><td><strong>${formatINR(exemptHRA)}</strong></td></tr>
            </table>
        </div>

        <p class="note">💡 Available only under the Old Tax Regime.</p>
        <p class="note">📊 If annual rent exceeds ₹1,00,000, landlord's PAN is required.</p>

        <a href="index.html" class="back-link">← Back to Home</a>
    `;
}

/* ============================================
   16. RD CALCULATOR (English)
   ============================================ */
function calculateRD() {
    const monthly = parseFloat(document.getElementById("rdAmount").value) || 0;
    const annualRate = parseFloat(document.getElementById("rdRate").value) || 0;
    const months = parseFloat(document.getElementById("rdMonths").value) || 0;
    const resultDiv = document.getElementById("rdResult");

    if (!monthly || monthly < 100) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Minimum monthly deposit is ₹100.</p>';
        return;
    }
    if (!annualRate || annualRate < 1 || annualRate > 15) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Interest rate must be between 1% and 15%.</p>';
        return;
    }
    if (!months || months < 6 || months > 120) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Tenure must be between 6 and 120 months.</p>';
        return;
    }

    // RD calculation with quarterly compounding
    // Each monthly installment earns interest for the remaining months
    const quarterlyRate = annualRate / 400; // quarterly rate as decimal
    let maturity = 0;

    for (let m = 1; m <= months; m++) {
        const monthsRemaining = months - m + 1;
        const quarters = monthsRemaining / 3;
        // Each installment compounds quarterly
        const installmentValue = monthly * Math.pow(1 + quarterlyRate, quarters);
        maturity += installmentValue;
    }

    const totalInvested = monthly * months;
    const interest = maturity - totalInvested;

    resultDiv.innerHTML = `
        <h2>RD Result</h2>

        <div class="emi-result-grid">
            <div class="emi-result-card">
                <span>Total Invested</span>
                <strong>${formatINR(totalInvested)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Interest Earned</span>
                <strong>${formatINR(interest)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Maturity Amount</span>
                <strong>${formatINR(maturity)}</strong>
            </div>
        </div>

        <p class="note">💡 Monthly deposit of ${formatINR(monthly)} for ${months} months at ${annualRate}% p.a.</p>
        <p class="note">📊 Interest is compounded quarterly. Actual rates may vary by bank.</p>
        <p class="note">⚠️ Interest is taxable. TDS applies if annual interest exceeds ₹40,000.</p>

        <a href="index.html" class="back-link">← Back to Home</a>
    `;
}

/* ============================================
   17. COMPOUND INTEREST CALCULATOR (English)
   ============================================ */
function calculateCompoundInterest() {
    const principal = parseFloat(document.getElementById("ciPrincipal").value) || 0;
    const annualRate = parseFloat(document.getElementById("ciRate").value) || 0;
    const years = parseFloat(document.getElementById("ciYears").value) || 0;
    const n = parseFloat(document.getElementById("ciFrequency").value) || 1;
    const resultDiv = document.getElementById("ciResult");

    if (!principal || principal <= 0) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Principal must be greater than 0.</p>';
        return;
    }
    if (!annualRate || annualRate < 0.1 || annualRate > 30) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Interest rate must be between 0.1% and 30%.</p>';
        return;
    }
    if (!years || years <= 0 || years > 50) {
        resultDiv.innerHTML = '<p class="error-msg">⚠️ Period must be between 1 and 50 years.</p>';
        return;
    }

    // Compound Interest: A = P × (1 + r/n)^(n×t)
    const rate = annualRate / 100;
    const maturity = principal * Math.pow(1 + rate / n, n * years);
    const compoundInterest = maturity - principal;

    // Simple Interest for comparison: SI = P × r × t
    const simpleInterest = principal * rate * years;
    const simpleTotal = principal + simpleInterest;

    // Difference
    const difference = compoundInterest - simpleInterest;

    const freqNames = {
        1: "Yearly",
        2: "Half-Yearly",
        4: "Quarterly",
        12: "Monthly",
        365: "Daily"
    };

    resultDiv.innerHTML = `
        <h2>Compound Interest Result</h2>

        <div class="emi-result-grid">
            <div class="emi-result-card">
                <span>Principal</span>
                <strong>${formatINR(principal)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Compound Interest</span>
                <strong>${formatINR(compoundInterest)}</strong>
            </div>
            <div class="emi-result-card">
                <span>Maturity Amount</span>
                <strong>${formatINR(maturity)}</strong>
            </div>
        </div>

        <h3>Compound vs Simple Interest</h3>
        <div class="table-wrap">
            <table class="amort-table">
                <tr><th>Type</th><th>Interest</th><th>Total Amount</th></tr>
                <tr><td>Compound Interest (${freqNames[n]})</td><td>${formatINR(compoundInterest)}</td><td>${formatINR(maturity)}</td></tr>
                <tr><td>Simple Interest</td><td>${formatINR(simpleInterest)}</td><td>${formatINR(simpleTotal)}</td></tr>
                <tr><td><strong>Difference</strong></td><td><strong>${formatINR(difference)}</strong></td><td><strong>-</strong></td></tr>
            </table>
        </div>

        <p class="note">💡 Compounding ${freqNames[n].toLowerCase()} gives you ${formatINR(difference)} more than simple interest.</p>
        <p class="note">📊 Formula: ${formatINR(principal)} × (1 + ${annualRate}%/${n})^(${n}×${years}) = ${formatINR(maturity)}</p>

        <a href="index.html" class="back-link">← Back to Home</a>
    `;
}
