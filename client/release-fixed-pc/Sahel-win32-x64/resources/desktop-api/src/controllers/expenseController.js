const { supabaseAdmin: supabase } = require("../config/supabase");

const getExpenses = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit || 100);

    let query = supabase
      .from("expenses")
      .select("*")
      .eq("shop_id", req.user.shop_id)
      .order("expense_date", { ascending: false })
      .limit(limit);

    if (req.query.month) {
      const from = `${req.query.month}-01T00:00:00.000Z`;
      const to = new Date(from);
      to.setUTCMonth(to.getUTCMonth() + 1);
      query = query.gte("expense_date", from).lt("expense_date", to.toISOString());
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ data });
  } catch (error) {
    next(error);
  }
};

const createExpense = async (req, res, next) => {
  try {
    const { category, amount, description, expense_date } = req.body;

    if (!category || !amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Category and amount greater than 0 are required." });
    }

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        shop_id: req.user.shop_id,
        category,
        amount: Number(amount),
        description: description || null,
        expense_date: expense_date || new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: "Expense added.", data });
  } catch (error) {
    next(error);
  }
};

const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id)
      .eq("shop_id", req.user.shop_id);

    if (error) throw error;

    res.json({ message: "Expense removed." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenses,
  createExpense,
  deleteExpense
};
