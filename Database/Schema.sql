DROP VIEW IF EXISTS view_user_balances, view_active_loans CASCADE;
DROP TABLE IF EXISTS withdrawal_log, settings, notifications, payments, charges, ebook_loans, reservations, loans, borrow_requests, ebook_editions, copies, titles, users CASCADE;
DROP TYPE IF EXISTS user_role, copy_status, withdrawn_reason, borrow_request_status, return_condition, reservation_status, ebook_loan_status, charge_type, charge_status, payment_method, ebook_file_format CASCADE;

CREATE TYPE user_role AS ENUM ('librarian', 'user');
CREATE TYPE copy_status AS ENUM ('available', 'on_hold', 'on_loan', 'withdrawn');
CREATE TYPE withdrawn_reason AS ENUM ('torn', 'dirty', 'lost');
CREATE TYPE borrow_request_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE return_condition AS ENUM ('ok', 'damaged', 'lost');
CREATE TYPE reservation_status AS ENUM ('waiting', 'notified', 'expired', 'cancelled', 'fulfilled');
CREATE TYPE ebook_loan_status AS ENUM ('active', 'grace', 'returned', 'removed');
-- 'membership_fee' added after initial launch: a recurring monthly charge that gates borrowing.
CREATE TYPE charge_type AS ENUM ('late_fee', 'damage', 'lost', 'ebook_grace_expiry', 'membership_fee');
CREATE TYPE charge_status AS ENUM ('unpaid', 'paid');
CREATE TYPE payment_method AS ENUM ('paystack', 'cash');
-- Added after initial launch (see ebook file upload feature): the uploaded
-- book file's format, so the reader knows which viewer to use.
CREATE TYPE ebook_file_format AS ENUM ('pdf', 'epub');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE titles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    replacement_cost NUMERIC(10, 2) NOT NULL CHECK (replacement_cost >= 0),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    cover_image_url TEXT -- Added after initial launch
);

CREATE TABLE copies (
    id SERIAL PRIMARY KEY,
    title_id INT NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
    shelf_location VARCHAR(50),
    arrangement_details VARCHAR(255),
    status copy_status NOT NULL DEFAULT 'available',
    withdrawn_reason withdrawn_reason,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_withdrawn_reason_consistency CHECK (
        (status = 'withdrawn' AND withdrawn_reason IS NOT NULL) OR
        (status != 'withdrawn' AND withdrawn_reason IS NULL)
    )
);

CREATE TABLE ebook_editions (
    id SERIAL PRIMARY KEY,
    title_id INT UNIQUE NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    -- Added after initial launch: the uploaded file itself, stored in
    -- Supabase Storage (bucket "ebooks"); file_url is that object's public URL.
    file_url TEXT,
    file_format ebook_file_format
);

CREATE TABLE borrow_requests (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    copy_id INT REFERENCES copies(id) ON DELETE SET NULL,
    status borrow_request_status NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    requested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    decided_at TIMESTAMPTZ,
    -- Added after initial launch: how long the student wants the loan for, chosen at
    -- request time (1 minute to 30 days). Carried onto the resulting loan row by
    -- trg_handle_borrow_request_approval, then applied to due_date at collection time.
    requested_duration_minutes INT NOT NULL DEFAULT 20160 CHECK (requested_duration_minutes BETWEEN 1 AND 43200)
);

CREATE TABLE loans (
    id SERIAL PRIMARY KEY,
    borrow_request_id INT UNIQUE REFERENCES borrow_requests(id) ON DELETE SET NULL,
    copy_id INT NOT NULL REFERENCES copies(id) ON DELETE RESTRICT,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hold_started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    hold_expires_at TIMESTAMPTZ,
    collected_at TIMESTAMPTZ,
    due_date TIMESTAMPTZ,
    returned_at TIMESTAMPTZ,
    return_condition return_condition,
    extended BOOLEAN DEFAULT FALSE,
    extended_due_date TIMESTAMPTZ,
    -- Added after initial launch: copied from borrow_requests.requested_duration_minutes
    -- by trg_handle_borrow_request_approval; null for loans created by reservation
    -- fulfillment (trg_handle_loan_return), which falls back to 14 days at collection.
    requested_duration_minutes INT,
    -- A real return always has both collected_at and return_condition set. The one
    -- exception (added after initial launch): an unclaimed hold being auto-released
    -- (see expireUnclaimedHolds) sets returned_at with collected_at/return_condition
    -- both left null, deliberately reusing trg_handle_loan_return's copy/reservation
    -- cascade instead of duplicating that logic in application code.
    CONSTRAINT chk_collected_before_returned CHECK (
        returned_at IS NULL OR collected_at IS NOT NULL OR return_condition IS NULL
    )
);

CREATE UNIQUE INDEX idx_loans_one_active_per_copy
    ON loans(copy_id) WHERE returned_at IS NULL;

CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    title_id INT NOT NULL REFERENCES titles(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    queue_position INT NOT NULL CHECK (queue_position > 0),
    status reservation_status NOT NULL DEFAULT 'waiting',
    notified_at TIMESTAMPTZ,
    window_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_reservations_unique_active_queue
    ON reservations(title_id, queue_position)
    WHERE status IN ('waiting', 'notified');

CREATE TABLE ebook_loans (
    id SERIAL PRIMARY KEY,
    ebook_edition_id INT NOT NULL REFERENCES ebook_editions(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    borrowed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    loan_expires_at TIMESTAMPTZ NOT NULL,
    grace_expires_at TIMESTAMPTZ,
    returned_at TIMESTAMPTZ,
    extended BOOLEAN DEFAULT FALSE,
    extended_expires_at TIMESTAMPTZ,
    status ebook_loan_status NOT NULL DEFAULT 'active'
);

CREATE UNIQUE INDEX idx_ebook_loans_one_active_per_edition_user
    ON ebook_loans(ebook_edition_id, user_id)
    WHERE status IN ('active', 'grace');

CREATE TABLE charges (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    loan_id INT REFERENCES loans(id) ON DELETE SET NULL,
    ebook_loan_id INT REFERENCES ebook_loans(id) ON DELETE SET NULL,
    type charge_type NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    status charge_status NOT NULL DEFAULT 'unpaid',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    cleared_at TIMESTAMPTZ
);

CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    charge_id INT NOT NULL REFERENCES charges(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    method payment_method NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    paystack_reference VARCHAR(255) UNIQUE,
    cleared_by_librarian_id INT REFERENCES users(id) ON DELETE SET NULL,
    paid_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_payment_method_fields CHECK (
        (method = 'paystack' AND paystack_reference IS NOT NULL) OR
        (method = 'cash' AND cleared_by_librarian_id IS NOT NULL)
    )
);

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(100) NOT NULL,
    reference_id INT,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE settings (
    key VARCHAR(100) PRIMARY KEY,
    value VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE withdrawal_log (
    id SERIAL PRIMARY KEY,
    copy_id INT NOT NULL REFERENCES copies(id) ON DELETE CASCADE,
    librarian_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason withdrawn_reason NOT NULL,
    withdrawn_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_copies_title_id ON copies(title_id);
CREATE INDEX idx_copies_status ON copies(status);
CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_loans_copy_id ON loans(copy_id);
CREATE INDEX idx_loans_due_date ON loans(due_date) WHERE returned_at IS NULL;
CREATE INDEX idx_reservations_title ON reservations(title_id);
CREATE INDEX idx_charges_user_status ON charges(user_id, status);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_ebook_loans_status ON ebook_loans(status);

CREATE OR REPLACE FUNCTION handle_borrow_request_approval()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
        NEW.decided_at := CURRENT_TIMESTAMP;

        INSERT INTO loans (borrow_request_id, copy_id, user_id, hold_expires_at, requested_duration_minutes)
        VALUES (NEW.id, NEW.copy_id, NEW.user_id, CURRENT_TIMESTAMP + INTERVAL '6 hours', NEW.requested_duration_minutes);

        UPDATE copies SET status = 'on_hold' WHERE id = NEW.copy_id;

    ELSIF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
        NEW.decided_at := CURRENT_TIMESTAMP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_handle_borrow_request_approval
BEFORE UPDATE ON borrow_requests
FOR EACH ROW
EXECUTE FUNCTION handle_borrow_request_approval();

CREATE OR REPLACE FUNCTION handle_loan_collection()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.collected_at IS NOT NULL AND OLD.collected_at IS NULL THEN
        IF NEW.due_date IS NULL THEN
            NEW.due_date := NEW.collected_at + (COALESCE(NEW.requested_duration_minutes, 20160) || ' minutes')::INTERVAL;
        END IF;

        UPDATE copies SET status = 'on_loan' WHERE id = NEW.copy_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_handle_loan_collection
BEFORE UPDATE ON loans
FOR EACH ROW
EXECUTE FUNCTION handle_loan_collection();

CREATE OR REPLACE FUNCTION handle_loan_return()
RETURNS TRIGGER AS $$
DECLARE
    next_res reservations%ROWTYPE;
    v_title_id INT;
BEGIN
    IF NEW.returned_at IS NOT NULL AND OLD.returned_at IS NULL THEN

        SELECT title_id INTO v_title_id FROM copies WHERE id = NEW.copy_id;

        SELECT * INTO next_res
        FROM reservations
        WHERE title_id = v_title_id AND status = 'waiting'
        ORDER BY queue_position ASC
        LIMIT 1;

        IF FOUND THEN
            UPDATE reservations
            SET status = 'notified',
                notified_at = CURRENT_TIMESTAMP,
                window_expires_at = CURRENT_TIMESTAMP + INTERVAL '6 hours'
            WHERE id = next_res.id;

            UPDATE copies SET status = 'on_hold' WHERE id = NEW.copy_id;

            INSERT INTO loans (copy_id, user_id, hold_expires_at)
            VALUES (NEW.copy_id, next_res.user_id, CURRENT_TIMESTAMP + INTERVAL '6 hours');
        ELSE
            UPDATE copies SET status = 'available' WHERE id = NEW.copy_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_handle_loan_return
AFTER UPDATE ON loans
FOR EACH ROW
EXECUTE FUNCTION handle_loan_return();

CREATE OR REPLACE FUNCTION check_unpaid_charges_before_borrow()
RETURNS TRIGGER AS $$
DECLARE
    unpaid_count INT;
BEGIN
    SELECT COUNT(*) INTO unpaid_count
    FROM charges
    WHERE user_id = NEW.user_id AND status = 'unpaid';

    IF unpaid_count > 0 THEN
        RAISE EXCEPTION 'User % has unpaid charges and cannot borrow new items.', NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_unpaid_charges
BEFORE INSERT ON borrow_requests
FOR EACH ROW
EXECUTE FUNCTION check_unpaid_charges_before_borrow();

CREATE OR REPLACE FUNCTION auto_clear_charge_on_payment()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE charges
    SET status = 'paid',
        cleared_at = CURRENT_TIMESTAMP
    WHERE id = NEW.charge_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_auto_clear_charge
AFTER INSERT ON payments
FOR EACH ROW
EXECUTE FUNCTION auto_clear_charge_on_payment();

CREATE OR REPLACE VIEW view_active_loans AS
SELECT
    l.id AS loan_id,
    u.id AS user_id,
    u.name AS user_name,
    u.email AS user_email,
    t.name AS book_title,
    c.shelf_location,
    l.hold_expires_at,
    l.collected_at,
    l.due_date,
    l.extended,
    CASE WHEN l.collected_at IS NULL THEN 'on_hold' ELSE 'on_loan' END AS loan_state
FROM loans l
JOIN users u ON l.user_id = u.id
JOIN copies c ON l.copy_id = c.id
JOIN titles t ON c.title_id = t.id
WHERE l.returned_at IS NULL;

CREATE OR REPLACE VIEW view_user_balances AS
SELECT
    u.id AS user_id,
    u.name AS user_name,
    u.email AS user_email,
    COALESCE(SUM(ch.amount), 0.00) AS total_unpaid_amount
FROM users u
LEFT JOIN charges ch ON u.id = ch.user_id AND ch.status = 'unpaid'
GROUP BY u.id, u.name, u.email;