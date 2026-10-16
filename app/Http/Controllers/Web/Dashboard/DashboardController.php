<?php

namespace App\Http\Controllers\Web\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Navbar;

class DashboardController extends Controller
{
    public function index ()
    {
        $navbars = Navbar::with('items')->get();

        return inertia('admin/dashboard', [
            'navbars' => $navbars,
        ]);
    }
    
}
